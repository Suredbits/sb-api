if (!process.env.MAGIC_UUID) {
  throw Error('You forgot to set MAGIC_UUID')
}

module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
}
