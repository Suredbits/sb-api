if (!process.env.MAGIC_UUID) {
  throw Error('You forgot to set MAGIC_UUID')
}

if (!process.env.MAGIC_PREIMAGE) {
  throw Error('You forgot to set MAGIC_PREIMAGE')
}

module.exports = {
  preset: 'ts-jest',
  globals: {
    'ts-jest': {
      // don't type check files when running tests,
      // that's what tsc are for :-)
      diagnostics: false,
    },
  },
  testEnvironment: 'node',
}
