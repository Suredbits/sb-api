import { Sockets } from '../../src/sockets/index'

import { SbWebSocket } from '../../src/sockets/common'
import { NbaSocket } from '../../src/sockets/nba'
import { MockLnClient } from '../mock.ln.client'

const sockets: SbWebSocket[] = []
let nbaSocket: NbaSocket = null as any

describe('NBA API socket', async () => {
  it('should query the info endpoint', async () => {
    const info = await nbaSocket.info()
    expect(info).toBeDefined()
  })

  it('should get players', async () => {
    const players = await nbaSocket.players({ firstName: 'Joel', lastName: 'Embiid' })
    expect(players.length).toBeGreaterThan(0)
  })

  it('should get games', async () => {
    const games = await nbaSocket.games({ day: 1, month: 3, year: 2017 })
    expect(games.length).toBeGreaterThan(0)
  })

  it('should get rosters', async () => {
    const rosters = await nbaSocket.roster({ teamId: 'HOU' })
    expect(rosters.length).toBeGreaterThan(0)
  })

  it('should get schedules', async () => {
    const schedules = await nbaSocket.schedule({ teamId: 'MIN' })
    expect(schedules.length).toBeGreaterThan(0)
  })

  it('should get stats by name', async () => {
    const stats = await nbaSocket.statsByName({
      firstName: 'Kevin',
      lastName: 'Durant',
      year: 2018,
      month: 11,
      day: 29,
    })
    expect(stats.length).toBeGreaterThan(0)
  })

  it('should get stats by ID', async () => {
    const stats = await nbaSocket.statsById({ gameId: '21600854', playerId: '201142' })
    expect(stats.length).toBeGreaterThan(0)
  })
})

afterAll(async () => {
  await Promise.all(sockets.map(socket => socket.close()))
})

beforeAll(async () => {
  nbaSocket = await Sockets.nba(MockLnClient)
  sockets.push(nbaSocket)
})
