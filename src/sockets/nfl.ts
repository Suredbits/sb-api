import { BitcoinNetwork, LightningApi } from '../lightning'
import { SeasonPhase, StatType } from '../types'
import { NflTeamType } from '../types/nfl'
import { API } from './common'
import { OnWsOpen } from './common'
import { PayPerCallSocket } from './paypercall'

import {
  NflGamesResponseType,
  NflPlayerResponseType,
  NflRosterResponseType,
  NflScheduleResponseType,
  NflStatsResponse,
  NflTypes,
} from '../types/nfl'
import { Omit } from '../types/util'

export class NflSocket extends PayPerCallSocket {
  constructor(ln: LightningApi, onOpen: OnWsOpen) {
    super(API.NFL, ln, onOpen, BitcoinNetwork.mainnet)
  }

  public games = (args: NflGamesRequestArgs): Promise<NflGamesResponseType> => {
    return this.sendRequest({ ...args, channel: 'games' }, NflTypes.GamesResponseType, 'NFL games') as any
  }

  public players = (args: NflPlayersRequestArgs): Promise<NflPlayerResponseType> => {
    return this.sendRequest({ ...args, channel: 'players' }, NflTypes.PlayersResponseType, 'NFL players') as any
  }

  public schedule = (args: Omit<NflTeamRequestArgs, 'retrieve'>): Promise<NflScheduleResponseType> => {
    return this.sendRequest(
      { ...args, channel: 'team', retrieve: 'schedule' },
      NflTypes.TeamScheduleResponseType,
      'NFL schedule'
    ) as any
  }

  public roster = (args: Omit<NflTeamRequestArgs, 'retrieve'>): Promise<NflRosterResponseType> => {
    return this.sendRequest(
      { ...args, channel: 'team', retrieve: 'roster' },
      NflTypes.TeamRosterResponseType,
      'NFL roster'
    ) as any
  }

  public statsById = (args: NflStatsByIdRequestArgs): Promise<NflStatsResponse> => {
    return this.sendRequest(
      { ...args, channel: 'stats' },
      NflTypes.StatsResponsesByType[args.statType],
      'NFL stats by ID'
    )
  }

  public statsByNameAndWeek = (args: NflStatsByNameWeekRequestArgs): Promise<NflStatsResponse> => {
    return this.sendRequest(
      { ...args, channel: 'stats' },
      NflTypes.StatsResponsesByType[args.statType],
      'NFL stats by name and week'
    )
  }
}

export class NflSocketTestnet extends PayPerCallSocket {
  constructor(ln: LightningApi, onOpen: OnWsOpen) {
    super(API.NFL, ln, onOpen, BitcoinNetwork.testnet)
  }

  public games = (args: NflGamesRequestArgs): Promise<NflGamesResponseType> => {
    return this.sendRequest({ ...args, channel: 'games' }, NflTypes.GamesResponseType, 'NFL games - testnet') as any
  }

  public players = (args: TestnetArgs<NflPlayersRequestArgs> = {}): Promise<NflPlayerResponseType> => {
    return this.sendRequest(
      { ...args, ...testnetVals, channel: 'players' },
      NflTypes.PlayersResponseType,
      'NFL players - testnet'
    ) as any
  }

  public schedule = (args: TestnetArgs<Omit<NflTeamRequestArgs, 'retrieve'>>): Promise<NflScheduleResponseType> => {
    return this.sendRequest(
      { ...args, ...testnetVals, channel: 'team', retrieve: 'schedule' },
      NflTypes.TeamScheduleResponseType,
      'NFL schedule - testnet'
    ) as any
  }

  public roster = (args: TestnetArgs<Omit<NflTeamRequestArgs, 'retrieve'>>): Promise<NflRosterResponseType> => {
    return this.sendRequest(
      { ...args, ...testnetVals, channel: 'team', retrieve: 'roster' },
      NflTypes.TeamRosterResponseType,
      'NFL roster - testnet'
    ) as any
  }

  public statsById = (args: TestnetArgs<NflStatsByIdRequestArgs>): Promise<NflStatsResponse> => {
    return this.sendRequest(
      { ...args, ...testnetVals, channel: 'stats' },
      NflTypes.StatsResponsesByType[args.statType],
      'NFL stats by ID - testnet'
    )
  }

  public statsByNameAndWeek = (args: TestnetArgs<NflStatsByNameWeekRequestArgs>): Promise<NflStatsResponse> => {
    return this.sendRequest(
      { ...args, ...testnetVals, channel: 'stats' },
      NflTypes.StatsResponsesByType[args.statType],
      'NFL stats by name and week - testnet'
    )
  }
}

type TestnetArgs<T> = Omit<T, keyof typeof testnetVals>

const testnetVals = {
  firstName: 'Tom',
  lastName: 'Brady',
}

export interface NflGamesRequestArgs {
  week: number
  seasonPhase: SeasonPhase
  year?: number
  teamId?: NflTeamType
  realtime?: boolean
}

export interface NflPlayersRequestArgs {
  firstName: string
  lastName: string
}

export interface NflTeamRequestArgs {
  teamId: NflTeamType
  retrieve: 'roster' | 'schedule'
  year?: number
}

export interface NflStatsByIdRequestArgs {
  statType: StatType
  gameId: string
  playerId: string
}

export interface NflStatsByNameWeekRequestArgs {
  statType: StatType
  year: number
  week: number
  seasonPhase: SeasonPhase
  firstName: string
  lastName: string
}
