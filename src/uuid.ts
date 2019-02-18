import genUUID from 'uuid'

export const UUID = {
  newUUID: (): string => {
    return process.env.MAGIC_UUID || genUUID()
  },
}
