import { BitcoinNetwork, LightningApi } from '../lightning'
import {
  NbaGamesResponseType,
  NbaInfoResponseType,
  NbaPlayerResponseType,
  NbaScheduleResponseType,
  NbaSeason,
  NbaStatsResponseType,
  NbaTeamType,
  NbaTypes,
} from '../types/nba'
import { Omit } from '../types/util'
import { API } from './common'
import { OnWsOpen } from './common'
import { PayPerCallSocket } from './paypercall'

export class NbaSocket extends PayPerCallSocket {
  constructor(ln: LightningApi, onOpen: OnWsOpen) {
    super(API.NBA, ln, onOpen, BitcoinNetwork.mainnet)
  }

  public info = (): Promise<NbaInfoResponseType> => this.sendRequest({ channel: 'info' }, NbaTypes.InfoType, 'NBA info')

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

  public statsById = (args: NbaStatsByIdRequestArgs): Promise<NbaStatsResponseType> => {
    return this.sendRequest(
      {
        ...args,
        channel: 'stats',
      },
      NbaTypes.StatsResponseType,
      'NBA stats by ID'
    )
  }

  public statsByName = (args: NbaStatsByNameWeekRequestArgs): Promise<NbaStatsResponseType> => {
    return this.sendRequest(
      {
        ...args,
        channel: 'stats',
      },
      NbaTypes.StatsResponseType,
      'NBA stats by name, week and year'
    )
  }
}

export class NbaSocketTestnet extends PayPerCallSocket {
  public constructor(ln: LightningApi, onOpen: OnWsOpen) {
    super(API.NBA, ln, onOpen, BitcoinNetwork.testnet)
  }

  public info = (): Promise<NbaInfoResponseType> =>
    this.sendRequest({ channel: 'info' }, NbaTypes.InfoType, 'NBA info - testnet')

  public games = (args: NbaGamesRequestArgs): Promise<NbaGamesResponseType> => {
    return this.sendRequest({ ...args, channel: 'games' }, NbaTypes.GamesResponseType, 'NBA games testnet')
  }

  public players = (args: TestnetArgs<NbaPlayersRequestArgs> = {}): Promise<NbaPlayerResponseType> => {
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

  public statsById = (args: TestnetArgs<NbaStatsByIdRequestArgs>): Promise<NbaStatsResponseType> => {
    return this.sendRequest(
      {
        ...args,
        channel: 'stats',
      },
      NbaTypes.StatsResponseType,
      'NBA stats by ID'
    )
  }

  public statsByName = (args: TestnetArgs<NbaStatsByNameWeekRequestArgs>): Promise<NbaStatsResponseType> => {
    return this.sendRequest(
      {
        ...args,
        channel: 'stats',
      },
      NbaTypes.StatsResponseType,
      'NBA stats by name, week and year'
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
  season?: NbaSeason
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
