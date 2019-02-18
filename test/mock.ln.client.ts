import { LightningApi } from '../src/lightning/index'

const SAMPLE_LN_INVOICE =
  'lnbc1pwx40xypp5dafh8wrcre5ynm7yjad2nm3lzq5n7t8994e7462ezjauaya4hdhqdpl235hqurfdcs8gmmjddjkcun0vaehgctyyq58g6tswp5kutndv55jsaf3xcenz2gcqzysxqyz5vqdh2clqnps6g3p7zqz33axrwhd5a8ntmuqnenh9gad7uy6x48f279xc6kfcxllafmg3w0vp0a9gzgz49sdxrmj4fghwr5r6neew56wfspa9pvaj'

export const MockLnClient: LightningApi = {
  getInfo: () => Promise.resolve(),
  receive: () => Promise.resolve(SAMPLE_LN_INVOICE),
  send: () => Promise.resolve(),
}
