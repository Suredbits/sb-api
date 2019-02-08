import { API } from '.'
import { BitcoinNetwork, LightningApi } from '../lightning'
import {
  NbaGamesResponseType,
  NbaPlayerResponseType,
  NbaScheduleResponseType,
  NbaTeamType,
  NbaTypes,
} from '../types/nba'
import { Omit } from '../types/util'
import { OnWsOpen, PayPerCallSocket } from './common'

export class NbaSocket extends PayPerCallSocket {
  constructor(ln: LightningApi, onOpen: OnWsOpen) {
    super(API.NBA, ln, onOpen, BitcoinNetwork.mainnet)
  }

  public info = () =>
    this.sendRequest({ channel: 'info' }, (() => {
      throw new Error('todo')
    })() as any) // TODO fix me

  public games = (args: NbaGamesRequestArgs): Promise<NbaGamesResponseType> => {
    return this.sendRequest({ ...args, channel: 'games' }, NbaTypes.GamesResponseType, 'NBA games')
  }

  public players = (args: NbaPlayersRequestArgs): Promise<NbaPlayerResponseType> => {
    return this.sendRequest({ ...args, channel: 'players' }, NbaTypes.PlayersResponseType, 'NBA players')
  }

  public schedule = (args: Omit<NbaTeamRequestArgs, 'retrieve'>): Promise<NbaScheduleResponseType> => {
    return this.sendRequest(
      { ...args, channel: 'team', retrieve: 'schedule' },
      NbaTypes.TeamScheduleResponseType,
      'NBA schedule'
    )
  }

  public roster = (args: Omit<NbaTeamRequestArgs, 'retrieve'>): Promise<NbaScheduleResponseType> => {
    return this.sendRequest(
      { ...args, channel: 'team', retrieve: 'roster' },
      NbaTypes.TeamRosterResponseType,
      'NBA roster'
    )
  }
}

export class NbaSocketTestnet extends PayPerCallSocket {
  public info = () =>
    this.sendRequest({ channel: 'info' }, (() => {
      throw new Error('todo')
    })() as any) // TODO fix me

  public games = (args: NbaGamesRequestArgs): Promise<NbaGamesResponseType> => {
    return this.sendRequest({ ...args, channel: 'games' }, NbaTypes.GamesResponseType, 'NBA games testnet')
  }

  public players = (args: TestnetArgs<NbaPlayersRequestArgs>): Promise<NbaPlayerResponseType> => {
    return this.sendRequest(
      { ...args, channel: 'players', ...testnetVals },
      NbaTypes.PlayersResponseType,
      'NBA players testnet'
    )
  }

  public schedule = (args: TestnetArgs<Omit<NbaTeamRequestArgs, 'retrieve'>>): Promise<NbaScheduleResponseType> => {
    return this.sendRequest(
      { ...args, channel: 'team', retrieve: 'schedule', ...testnetVals },
      NbaTypes.TeamScheduleResponseType,
      'NBA schedule testnet'
    )
  }

  public roster = (args: TestnetArgs<Omit<NbaTeamRequestArgs, 'retrieve'>>): Promise<NbaScheduleResponseType> => {
    return this.sendRequest(
      { ...args, channel: 'team', retrieve: 'roster', ...testnetVals },
      NbaTypes.TeamRosterResponseType,
      'NBA roster testnet'
    )
  }
}

type TestnetArgs<T> = Omit<T, keyof typeof testnetVals>

const testnetVals = {
  firstName: 'Lebron',
  lastName: 'James',
}

interface NbaGamesRequestArgs {
  year: number
  month: number
  day: number
  teamId?: NbaTeamType
}

interface NbaPlayersRequestArgs {
  firstName: string
  lastName: string
}

interface NbaTeamRequestArgs {
  teamId: NbaTeamType
  retrieve: 'roster' | 'schedule'
  season?: number
}

interface NbaStatsByIdRequestArgs {
  gameId: string
  playerId: string
}

interface NbaStatsByNameWeekRequestArgs {
  year: number
  month: number
  day: number
  firstName: string
  lastName: string
}
