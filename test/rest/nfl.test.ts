import { NflRestAPI } from '../../src/rest/nfl'
import { MockLnClient } from '../mock.ln.client'

describe('NFL REST API', async () => {
  it('should get players', async () => {
    const players = await NflRestAPI(MockLnClient).players({ firstName: 'Colin', lastName: 'Kaepernick' })
    expect(players.length).toBeGreaterThan(0)
  })

  it('should get games', async () => {
    const games = await NflRestAPI(MockLnClient).games({ seasonPhase: 'regular', week: 8, year: 2019 })
    expect(games.length).toBeGreaterThan(0)
  })

  it('should get rosters', async () => {
    const rosters = await NflRestAPI(MockLnClient).roster({ teamId: 'SF' })
    expect(rosters.length).toBeGreaterThan(0)
  })

  it('should get schedules', async () => {
    const schedules = await NflRestAPI(MockLnClient).schedule({ teamId: 'WAS' })
    expect(schedules.length).toBeGreaterThan(0)
  })

  // TODO get all stats categories

  it('should get stats by name', async () => {
    const stats = await NflRestAPI(MockLnClient).statsByName({
      statType: 'passing',
      lastName: 'Brees',
      firstName: 'Drew',
      seasonPhase: 'regular',
      week: 1,
      year: 2017,
    })
    expect(stats.length).toBeGreaterThan(0)
  })

  it('should get stats by ID', async () => {
    const stats = await NflRestAPI(MockLnClient).statsById({
      gameId: '2016101604',
      playerId: '00-0027973',
      statType: 'passing',
    })
    expect(stats.length).toBeGreaterThan(0)
  })
})
