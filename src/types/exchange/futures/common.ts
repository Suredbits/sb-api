import * as t from 'io-ts'

export const MaturationIntervalType = t.keyof({
  perpetual: t.null,
  monthly: t.null,
  quarterly: t.null,
  biquarterly: t.null,
})

export const FuturesTradeReason = t.keyof({ fill: t.null, liquidation: t.null, termination: t.string })
