import * as t from 'io-ts'
import * as types from 'io-ts-types'
import { PathReporter } from 'io-ts/lib/PathReporter'
import WebSocket from 'ws'
// import { ValidationLogger } from "../logging";
import { Exchange } from './exchange'
import { ALL_BOOKS_DATA_TYPES } from './exchange/books'
import { ExchangeSymbol } from './exchange/symbols'
import { ALL_TICKERS_DATA_TYPES } from './exchange/tickers'
import { ALL_TRADES_DATA_TYPES } from './exchange/trades'
import { NbaTypes } from './nba'
import { NflTypes } from './nfl'

export type SeasonPhase = 'Preseason' | 'Regular' | 'Postseason'
export type StatType = 'passing' | 'rushing' | 'receiving' | 'defense'

interface ValidateDataResult {
  uuid: string
  data: any[] | object
}

interface ValidateSnapshotResult {
  uuid: string
  snapshot: any[]
}

type OnError = (err: any) => any

export class DataValidationError extends Error {
  constructor(msg: string) {
    super(msg)
    this.name = 'DataValidationError'
  }
}

const ValidationLogger = null as any

const validate = (data: any[] | object, type: t.Type<any>, onError: OnError) => {
  if (Array.isArray(data)) {
    ValidationLogger.debug(`Validating %O $`, data.slice(0, 3))
    if (data.length > 3) {
      ValidationLogger.debug('( + %d more elements)', data.length - 3)
    }
  } else {
    ValidationLogger.debug(`Validating %O $`, data)
  }

  const decodedE = type.decode(data)
  const decoded = decodedE.getOrElseL(() => {
    const paths = PathReporter.report(decodedE)
    ValidationLogger.error('Got errors while validating a %s: %O', type.name, paths)
    const pathsStr = paths.join('\n')
    return onError(new DataValidationError(pathsStr))
  })
  ValidationLogger.debug(`Validation of ${type.name} OK`)
  return decoded
}

export const validateSnapshotMessage = (
  msg: WebSocket.Data,
  type: t.Type<any>,
  onError: OnError
): ValidateSnapshotResult => {
  const msgStr = msg.toString()
  const json: { uuid?: string; snapshot?: any[] } = JSON.parse(msgStr)
  ValidationLogger.debug('Got snapshot validation request for %s', type.name)
  const { uuid, snapshot } = json
  if (!uuid) {
    return onError(`Message ${msgStr} has no UUID`)
  } else if (!snapshot) {
    return onError(`Message ${msgStr} has no 'snapshot' field!`)
  } else if (!Array.isArray(snapshot)) {
    return onError(`Snapshot in message ${msgStr} is not an array!`)
  }

  const decoded = validate(snapshot, type, onError)
  ValidationLogger.debug('Snapshot validation OK')
  return { uuid, snapshot: decoded }
}

export const validateDataMessage = (msg: WebSocket.Data, type: t.Type<any>, onError: OnError): ValidateDataResult => {
  const msgStr = msg.toString()
  const json: { uuid?: string; data?: any[] } = JSON.parse(msgStr)
  ValidationLogger.debug('Got data validation request for %s', type.name)
  const { uuid, data } = json
  if (Array.isArray(data)) {
    ValidationLogger.debug(`Data is array with ${data.length} elements`)
    const firstElem = data[0]
    if (firstElem) {
      ValidationLogger.debug('First elemeht: %O', firstElem)
    }
  }
  if (!uuid) {
    return onError(`Message ${msgStr} has no UUID!`)
  } else if (!data) {
    return onError(`Message ${msgStr} has no 'data' field!`)
  }

  const decoded = validate(data, type, onError)
  ValidationLogger.debug('Data message validation OK')

  return { uuid, data: decoded }
}

export type WelcomeMessageType = t.TypeOf<typeof MessageTypes.Welcome>
export interface PpcDataMessageType {
  uuid: string
  data: any[]
}

const PAYMENT_RECEIVED = 'payment received'
interface PaymentReceivedMessage {
  uuid: string
  exchange: Exchange
  symbol: ExchangeSymbol
  duration: number
  event: typeof PAYMENT_RECEIVED
}

interface TimeWarningMessage {
  uuid: string
  warnings: {
    duration: number
  }
}

const UNSUBSCRIBED = 'unsubscribed'
interface SubscriptionEnded {
  uuid: string
  amountRefunded: number
  event: typeof UNSUBSCRIBED
}

export interface ExchangeDataMessageType {
  uuid: string
  data: object
}

const ALL_PPC_DATA_RESPONSE_TYPES: Array<t.Type<any>> = [...NflTypes.ALL_NFL_TYPES, ...NbaTypes.ALL_NBA_TYPES]

const ALL_EXCHANGE_DATA_RESPONSE_TYPES: Array<t.Type<any>> = [
  ...ALL_BOOKS_DATA_TYPES,
  ...ALL_TICKERS_DATA_TYPES,
  ...ALL_TRADES_DATA_TYPES,
]

export class MessageTypes {
  public static Welcome = t.type(
    {
      message: t.string,
      ln_uri: t.string,
      version: t.Integer,
      openChannels: t.array(t.string),
    },
    'InitMsgType'
  )

  public static Invoice = t.type(
    {
      uuid: types.uuid,
      invoice: t.string,
    },
    'LnInvoiceType'
  )

  public static isInvoice = (msg: any): msg is t.TypeOf<typeof MessageTypes.Invoice> => typeof msg.invoice === 'string'

  public static isSnapshot = (msg: any): msg is { uuid: string; snapshot: any[] } =>
    msg.snapshot && Array.isArray(msg.snapshot) && typeof msg.uuid === 'string'

  public static isInitMsg = (msg: any): msg is t.TypeOf<typeof MessageTypes.Welcome> => typeof msg.ln_uri === 'string'

  public static hasUuid = (msg: any): msg is { uuid: string } => typeof msg.uuid === 'string'

  public static hasDataAndUuid = (msg: any): msg is { data: any[]; uuid: string } =>
    Array.isArray(msg.data) && MessageTypes.hasUuid(msg)

  public static isPpcDataResponse = (msg: any, type: t.Type<any>): msg is PpcDataMessageType =>
    msg && ALL_PPC_DATA_RESPONSE_TYPES.includes(type) // the && is to avoid TS nagging about unused param

  public static isExchangeDataResponse = (msg: any, type: t.Type<any>): msg is ExchangeDataMessageType =>
    msg && msg.data && ALL_EXCHANGE_DATA_RESPONSE_TYPES.includes(type)

  public static isPaymentReceived = (msg: any): msg is PaymentReceivedMessage =>
    typeof msg.uuid === 'string' &&
    typeof msg.exchange === 'string' &&
    typeof msg.duration === 'number' &&
    msg.event === PAYMENT_RECEIVED &&
    typeof msg.symbol === 'string'

  public static isTimeWarning = (msg: Partial<TimeWarningMessage>): msg is TimeWarningMessage =>
    typeof msg.uuid === 'string' && msg.warnings !== undefined && typeof msg.warnings.duration === 'number'

  public static isUnubscribed = (msg: Partial<SubscriptionEnded>): msg is SubscriptionEnded =>
    typeof msg.uuid === 'string' && msg.event === UNSUBSCRIBED && typeof msg.amountRefunded === 'number'
}
