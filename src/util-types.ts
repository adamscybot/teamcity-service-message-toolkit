import { Messages } from './messages/wrappers/OLDdefault-messages.js'

export type InstanceFromClass<T extends new (...args: any[]) => any> =
  T extends new (...args: any[]) => any ? InstanceType<T> : never
