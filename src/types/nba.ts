import * as t from 'io-ts'
import * as types from 'io-ts-types'

export type NbaTeamType = t.TypeOf<typeof NbaTypes.TeamType>
export type NbaGamesResponseType = t.TypeOf<typeof NbaTypes.GamesResponseType>
export type NbaPlayerResponseType = t.TypeOf<typeof NbaTypes.PlayersResponseType>
export type NbaScheduleResponseType = t.TypeOf<typeof NbaTypes.TeamScheduleResponseType>
export type NbaRosterResponseType = t.TypeOf<typeof NbaTypes.TeamRosterResponseType>

const SeasonPhaseType = t.keyof({
  Regular: t.null,
  Preseason: t.null,
  Postseason: t.null,
})

export class NbaTypes {
  public static getChannelType = (channel: string) => {
    switch (channel) {
      case 'games':
        return NbaTypes.GamesResponseType
      case 'schedule':
        return NbaTypes.TeamScheduleResponseType
      case 'roster':
        return NbaTypes.TeamRosterResponseType
      case 'players':
        return NbaTypes.PlayersResponseType
      case 'stats':
        throw TypeError('Havent implemented stats')
      default:
        throw TypeError('Unexpected channel ' + channel)
    }
  }

  public static TeamType = t.keyof({
    ATL: t.null,
    PHI: t.null,
    MIA: t.null,
    DET: t.null,
    BKN: t.null,
    PHX: t.null,
    MIL: t.null,
    GSW: t.null,
    BOS: t.null,
    POR: t.null,
    MIN: t.null,
    HOU: t.null,
    CHA: t.null,
    SAC: t.null,
    NOP: t.null,
    IND: t.null,
    CHI: t.null,
    SAS: t.null,
    NYK: t.null,
    LAC: t.null,
    CLE: t.null,
    TOR: t.null,
    OKC: t.null,
    LAL: t.null,
    DAL: t.null,
    UTA: t.null,
    ORL: t.null,
    MEM: t.null,
    DEN: t.null,
    WAS: t.null,
  })

  public static GamesResponseType = t.array(
    t.type({
      gameId: t.Integer,
      startTime: types.DateFromISOString,
      homeTeam: t.type({
        teamID: NbaTypes.TeamType,
        finalScore: t.Integer,
      }),
      awayTeam: t.type({
        teamID: NbaTypes.TeamType,
        finalScore: t.Integer,
      }),
      finished: t.boolean,
      seasonPhase: SeasonPhaseType,
      year: t.string,
    })
  )

  public static PlayersResponseType = t.array(
    t.intersection([
      t.type({
        playerId: t.Integer,
        firstName: t.string,
        lastName: t.string,
        rookieYear: t.Integer,
        lastYear: t.Integer,
        birthDate: types.DateFromISOString,
        status: t.string, // fix
        profileUrl: t.string,
        fullName: t.string,
        team: NbaTypes.TeamType,
      }),
      t.partial({}),
    ])
  )

  public static TeamRosterResponseType = NbaTypes.PlayersResponseType
  public static TeamScheduleResponseType = NbaTypes.GamesResponseType

  public static ALL_NBA_TYPES = [
    NbaTypes.GamesResponseType,
    NbaTypes.PlayersResponseType,
    NbaTypes.TeamRosterResponseType,
    NbaTypes.TeamScheduleResponseType,
  ]
}
