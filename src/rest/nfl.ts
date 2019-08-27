import * as t from 'io-ts'

import assertNever from 'assert-never'
import { BitcoinNetwork, LightningApi } from '../lightning'
import { NflStatsResponse, NflTeamType, NflTypes } from '../types/nfl'
import { makeRestRequest } from './rest'

export type StatType = 'passing' | 'rushing' | 'receiving' | 'defense'

export type SeasonPhase = 'preseason' | 'regular' | 'postseason'

export interface NflStatsByNameWeekRequestArgs<S extends StatType> {
  /** Defaults to mainnet */
  network?: BitcoinNetwork
  statType: S
  year: number
  week: number
  seasonPhase: SeasonPhase
  firstName: string
  lastName: string
}

export interface NflStatsByIdRequestArgs<S extends StatType> {
  /** Defaults to mainnet */
  network?: BitcoinNetwork
  statType: S
  gameId: string
  playerId: string
}

export type NflGamesRequestArgs = NflRealtimeGames | NflHistoricalGames

interface NflRealtimeGames {
  /** Defaults to mainnet */
  network?: BitcoinNetwork
  realtime: true
  teamId?: NflTeamType
}

interface NflHistoricalGames {
  /** Defaults to mainnet */
  network?: BitcoinNetwork
  realtime: false
  week: number
  year: number
  seasonPhase: SeasonPhase
  teamId?: NflTeamType
}

export interface NflPlayersRequestArgs {
  /** Defaults to mainnet */
  network?: BitcoinNetwork
  firstName: string
  lastName: string
}

interface NflTeamRequestArgs {
  /** Defaults to mainnet */
  network?: BitcoinNetwork
  teamId: NflTeamType
  year?: number
}

const getBaseURL = (network: BitcoinNetwork): string => {
  if (network === 'mainnet') {
    return 'https://api.suredbits.com/nfl/v0'
  } else if (network === 'testnet') {
    return 'https://test.api.suredbits.com/nfl/v0'
  } else {
    return assertNever(network)
  }
}

export const NflRestAPI = (lightning: LightningApi) => ({
  games: async ({ network = 'mainnet', ...args }: NflGamesRequestArgs) => {
    const unfiltered: Array<number | string | boolean | undefined> = args.realtime
      ? [args.realtime, args.teamId]
      : [args.week, args.seasonPhase, args.year, args.teamId]

    const filtered = unfiltered.filter(arg => arg !== undefined)
    return makeRestRequest(lightning, getBaseURL(network) + `/games/${filtered.join('/')}`, NflTypes.GamesResponseType)
  },
  players: async ({ firstName, lastName, network = 'mainnet' }: NflPlayersRequestArgs) => {
    return makeRestRequest(
      lightning,
      getBaseURL(network) + `/players/${firstName}/${lastName}`,
      NflTypes.PlayersResponseType
    )
  },
  roster: async ({ teamId, year, network = 'mainnet' }: NflTeamRequestArgs) => {
    return makeRestRequest(
      lightning,
      getBaseURL(network) + '/team/' + [teamId, 'retrieve', year].filter(f => f !== undefined).join('/'),
      NflTypes.TeamRosterResponseType
    )
  },
  schedule: async ({ teamId, year, network = 'mainnet' }: NflTeamRequestArgs) => {
    return makeRestRequest(
      lightning,
      getBaseURL(network) + '/team' + [teamId, 'roster', year].filter(f => f !== undefined).join('/'),
      NflTypes.TeamScheduleResponseType
    )
  },
  statsById: async <S extends StatType>({
    gameId,
    playerId,
    network = 'mainnet',
    statType,
  }: NflStatsByIdRequestArgs<S>): Promise<NflStatsResponse<S>> => {
    const filteredArgs = ['/stats', statType, gameId, playerId].filter(e => e !== undefined)

    // to make the compiler happy we have to execute each branch of `statType` separately
    // otherwise we won't be able to call `makeRestRequest` with a union type
    const executeReq = <T>(type: t.Type<T>) =>
      makeRestRequest(lightning, getBaseURL(network) + filteredArgs.join('/'), type)

    if (statType === 'defense') {
      return executeReq(NflTypes.StatsResponsesByType.defense)
    } else if (statType === 'passing') {
      return executeReq(NflTypes.StatsResponsesByType.passing)
    } else if (statType === 'receiving') {
      return executeReq(NflTypes.StatsResponsesByType.receiving)
    } else if (statType === 'rushing') {
      return executeReq(NflTypes.StatsResponsesByType.rushing)
    } else {
      // for some reason the exhaustiveness check breaks down here, because
      // of a generic parameter of statType. this is happening even though
      // all four cases are covered above. would be nice to get rid of this
      // cast, but I'm not sure how to do that...
      return assertNever(statType as never)
    }
  },
  statsByName: async <S extends StatType>({
    firstName,
    lastName,
    seasonPhase,
    statType,
    week,
    year,
    network = 'mainnet',
  }: NflStatsByNameWeekRequestArgs<S>): Promise<NflStatsResponse<S>> => {
    const args = ['/stats', statType, year, week, seasonPhase, firstName, lastName]

    // to make the compiler happy we have to execute each branch of `statType` separately
    // otherwise we won't be able to call `makeRestRequest` with a union type
    const executeReq = <T>(type: t.Type<T>) => makeRestRequest(lightning, getBaseURL(network) + args.join('/'), type)

    if (statType === 'defense') {
      return executeReq(NflTypes.StatsResponsesByType.defense)
    } else if (statType === 'passing') {
      return executeReq(NflTypes.StatsResponsesByType.passing)
    } else if (statType === 'receiving') {
      return executeReq(NflTypes.StatsResponsesByType.receiving)
    } else if (statType === 'rushing') {
      return executeReq(NflTypes.StatsResponsesByType.rushing)
    } else {
      // for some reason the exhaustiveness check breaks down here, because
      // of a generic parameter of statType. this is happening even though
      // all four cases are covered above. would be nice to get rid of this
      // cast, but I'm not sure how to do that...
      return assertNever(statType as never)
    }
  },
})
