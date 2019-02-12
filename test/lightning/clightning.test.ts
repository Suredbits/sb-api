import makeDebug from 'debug'

import { CLightning } from '../../src/lightning/clightning'

let client: CLightning = null as any // will get set in first test

/**
 * Test expect an already running lightningd instance
 */
describe('c-lightning interaction', () => {
  it('should be able to get a CLightning client', async () => {
    client = await CLightning()
  })

  it('should be able to call getinfo', async () => {
    const info = await client.getInfo()
    expect(info).toBeDefined()
  })

  it('should be able to generate an invoice', async () => {
    const invoice = await client.receive()
    expect(invoice).toBeDefined()
  })
})

afterAll(async () => {
  return
})
