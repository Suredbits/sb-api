import * as t from 'io-ts'
import * as types from 'io-ts-types'

import { StatType } from '.'

export type NflTeamType = t.TypeOf<typeof NflTypes.NflTeamType>
export type NflGamesResponseType = t.TypeOf<typeof NflTypes.GamesResponseType>
export type NflPlayerResponseType = t.TypeOf<typeof NflTypes.PlayersResponseType>
export type NflScheduleResponseType = t.TypeOf<typeof NflTypes.TeamScheduleResponseType>
export type NflRosterResponseType = t.TypeOf<typeof NflTypes.TeamRosterResponseType>
export type NflStatsResponse<T extends StatType> = t.TypeOf<typeof NflTypes.StatsResponsesByType[T]>
export type NflInfoResponse = t.TypeOf<typeof NflTypes.InfoType>

export class NflTypes {
  public static NflTeamType = t.keyof({
    ARI: t.null,
    LA: t.null,
    ATL: t.null,
    MIA: t.null,
    BAL: t.null,
    MIN: t.null,
    BUF: t.null,
    NE: t.null,
    CAR: t.null,
    NO: t.null,
    CHI: t.null,
    NYG: t.null,
    CIN: t.null,
    NYJ: t.null,
    CLE: t.null,
    OAK: t.null,
    DAL: t.null,
    PHI: t.null,
    DEN: t.null,
    PIT: t.null,
    DET: t.null,
    SD: t.null,
    GB: t.null,
    SEA: t.null,
    HOU: t.null,
    SF: t.null,
    IND: t.null,
    TB: t.null,
    JAC: t.null,
    TEN: t.null,
    KC: t.null,
    WAS: t.null,
    UNK: t.null,
  })

  private static PlayerType = t.intersection([
    t.type({
      playerId: t.string,
      gsisName: t.string,
      fullName: t.string,
      firstName: t.string,
      lastName: t.string,
      team: NflTypes.NflTeamType,
      position: t.string, // fix
      profileId: t.Integer,
      profileUrl: t.string,
      college: t.string,
      height: t.Integer,
      weight: t.Integer,
      status: t.string, // fix
    }),
    t.partial({
      birthDate: t.string,
      yearsPro: t.Integer,
    }),
  ])

  private static WeekDays = t.keyof({
    Monday: t.null,
    Tuesday: t.null,
    Wednesday: t.null,
    Wednesda: t.null,
    Thursday: t.null,
    Friday: t.null,
    Saturday: t.null,
    Sunday: t.null,
  })

  private static SeasonTypes = t.keyof({
    Regular: t.null,
    Postseason: t.null,
    Preseason: t.null,
  })

  public static InfoType = t.type({
    version: t.string,
    lastRosterDownload: types.DateFromISOString,
    seasonType: NflTypes.SeasonTypes,
    seasonYear: t.Integer,
    week: t.string,
  })

  private static TeamWithScoresType = t.type({
    team: t.string,
    score: t.Integer,
    scoreQ1: t.Integer,
    scoreQ2: t.Integer,
    scoreQ3: t.Integer,
    scoreQ4: t.Integer,
    turnovers: t.Integer,
  })

  public static PlayersResponseType = t.array(NflTypes.PlayerType, 'NflPlayersResponseType')

  public static TeamRosterResponseType = t.array(NflTypes.PlayerType, 'NflTeamRosterResponseType')

  public static Game = t.type(
    {
      gsisId: t.string,
      gameKey: t.string,
      startTime: types.DateFromISOString,
      week: t.string,
      dayOfWeek: NflTypes.WeekDays,
      seasonYear: t.Integer,
      seasonType: NflTypes.SeasonTypes,
      finished: t.boolean,
      homeTeam: NflTypes.TeamWithScoresType,
      awayTeam: NflTypes.TeamWithScoresType,
      timeInserted: types.DateFromISOString,
      timeUpdate: types.DateFromISOString,
    },
    'NflGame'
  )

  public static GamesResponseType = t.array(NflTypes.Game, 'NflGamesResponseType')

  public static TeamScheduleResponseType = t.array(NflTypes.Game, 'NflTeamScheduleResponseType ')

  public static PassingStats = t.array(
    t.type({
      att: t.Integer,
      cmp: t.Integer,
      cmpAirYds: t.Integer,
      inCmp: t.Integer,
      inCmpAirYds: t.Integer,
      passingInt: t.Integer,
      sack: t.Integer,
      sackYds: t.Integer,
      passingTds: t.Integer,
      passingTwoPointAttempt: t.Integer,
      passingTwoPointAttemptMade: t.Integer,
      passingTwoPointAttemptMissed: t.Integer,
      passingYds: t.Integer,
    }),
    'NflPassingStats'
  )

  public static DefenseStats = t.array(
    t.type({
      assistedTackles: t.Integer,
      forcedFumbles: t.Integer,
      fgBlk: t.Integer,
      recoveredFumbles: t.Integer,
      recoveredFumbleTD: t.Integer,
      recoveredFumbleYds: t.Integer,
      defenseInt: t.Integer,
      intTds: t.Integer,
      intYds: t.Integer,
      miscTds: t.Integer,
      miscYds: t.Integer,
      passDef: t.Integer,
      punkBlk: t.Integer,
      qbHit: t.Integer,
      safety: t.Integer,
      defenseSack: t.Integer,
      defenseSackYds: t.Integer,
      tackle: t.Integer,
      tackleLoss: t.Integer,
      tackleLossYards: t.Integer,
      tacklePrimary: t.Integer,
      extraPointBlock: t.Integer,
    }),
    'NflDefenseStats'
  )

  public static ReceivingStats = t.array(
    t.type({
      rec: t.Integer,
      target: t.Integer,
      tds: t.Integer,
      receivingTwoPointAttempt: t.Integer,
      receivingTwoPointAttemptMade: t.Integer,
      receivingTwoPointAttemptMissed: t.Integer,
      yacYds: t.Integer,
      receivingYds: t.Integer,
      fumblesLost: t.Integer,
    }),
    'NflReceivingStats'
  )

  public static RushingStats = t.array(
    t.type({
      attempt: t.Integer,
      loss: t.Integer,
      lossYds: t.Integer,
      tds: t.Integer,
      rushingTwoPointAttempt: t.Integer,
      rushingTwoPointAttemptMade: t.Integer,
      rushingTwoPointAttemptMissed: t.Integer,
      rushingYds: t.Integer,
      fumblesLost: t.Integer,
    }),
    'NflRushingStats'
  )

  public static StatsResponsesByType = {
    defense: NflTypes.DefenseStats,
    passing: NflTypes.PassingStats,
    receiving: NflTypes.ReceivingStats,
    rushing: NflTypes.RushingStats,
  }

  public static StatsResponse = t.intersection(
    [NflTypes.PassingStats, NflTypes.DefenseStats, NflTypes.ReceivingStats, NflTypes.RushingStats],
    'NflStatsResponse'
  )

  public static ALL_NFL_TYPES = [
    NflTypes.GamesResponseType,
    NflTypes.PlayersResponseType,
    NflTypes.TeamRosterResponseType,
    NflTypes.TeamScheduleResponseType,
    NflTypes.PassingStats,
    NflTypes.DefenseStats,
    NflTypes.RushingStats,
    NflTypes.ReceivingStats,
  ]
}
