import * as t from 'io-ts'

const KrakenFuturesBookFields = (t.never as any) as t.Type<any>

export const ExchangeFuturesBooksTypes = {
  kraken: {
    data: t.refinement(KrakenFuturesBookFields, () => true, 'KrakenFuturesBooksDataType'),
    snapshot: t.array(KrakenFuturesBookFields, 'KrakenFuturesBooksDataType'),
  },
}

export const ALL_FUTURES_BOOKS_DATA_TYPES = [ExchangeFuturesBooksTypes.kraken.data]
