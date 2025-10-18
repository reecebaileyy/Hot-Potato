import { parseEventLogs } from 'viem'

export function safeParseEventLogs<T extends object>(
  abi: any,
  eventName: string,
  logs: any[]
): Array<{ args?: T }> {
  return parseEventLogs({ abi, eventName, logs, strict: false }) as unknown as Array<{ args?: T }>
}
