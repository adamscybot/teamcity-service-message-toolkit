import { ZodErrorMap } from 'zod'
import { Messages, TcMessage } from './wrappers/default-messages.js'
import {
  TcMultiAttributeMessage,
  TcSingleAttributeMessage,
} from './wrappers/base-message-types.js'
import type { InstanceFromClass } from '../util-types.js'

type IsLiteral<T> = T extends any ? (string extends T ? false : true) : never
type TrimWhitespace<S extends string> = S extends ` ${infer R}`
  ? TrimWhitespace<R>
  : S

export type MessageValidationErrors = ZodErrorMap

export interface TcBaseMessageInterface {
  messageName(): string
  flowId(): string | undefined
}

export interface TcBaseSingleAttributeMessageInterface<ValueType>
  extends TcBaseMessageInterface {
  value(value: ValueType): this
  value(): ValueType | undefined
  rawValue(value: string): this
  rawValue(): string | undefined
  rawValue(value?: string | undefined): string | undefined | this
}

export type TcMultiPropertyAttributeMap = Record<
  string,
  { type: any; required?: boolean }
>

export type ApplyAttributeValueRules<
  AttributeMap extends TcMultiPropertyAttributeMap,
  Key extends keyof AttributeMap
> =
  | AttributeMap[Key]['type']
  | (AttributeMap[Key]['required'] extends true ? void : undefined)

export type TcMultiPropertyValidatedModifier<
  AttributeMap extends TcMultiPropertyAttributeMap
> = {
  attr: <Key extends keyof AttributeMap>(
    key: Key
  ) => ApplyAttributeValueRules<AttributeMap, Key>
}

export interface TcBaseMultiAttributeMessageInterface<
  AttributeMap extends TcMultiPropertyAttributeMap
> extends TcBaseMessageInterface {
  attr<Key extends keyof AttributeMap>(
    key: Key
  ): AttributeMap[Key]['type'] | undefined
  attr<Key extends keyof AttributeMap>(
    key: Key,
    value: AttributeMap[Key]['type']
  ): this
  rawAttr(key: string, value: string): this
  rawAttr(key: string): string | undefined
  rawAttr(key?: string | undefined): string | undefined | this
}

export type MessageMap = Record<
  string,
  TcSingleAttributeMessageInterface | TcMultiAttributeMessageInterface<any>
>

export type MessageWithStaticName = {
  new (...args: any[]): any
  messageName: string
}

/**
 * A utility type that takes an array of classes that each contain a `messageName` static property
 * which is used to index a new `MessageMap` type for use with a repostitory.
 */
export type MessageMapFromStaticType<T extends MessageWithStaticName> = {
  [K in T['messageName']]: Extract<T, { messageName: K }>
}

export type ExtractAttributeKeys<Attrs> =
  Attrs extends `${infer Attr} ${infer Rest}`
    ? Attr extends `${infer Name}=${string}`
      ? Name | ExtractAttributeKeys<TrimWhitespace<Rest>>
      : never
    : Attrs extends `${infer Name}=${string}${infer Rest}`
    ? Name | ExtractAttributeKeys<Rest>
    : never

export type UnpackMessageString<Line> =
  Line extends `##teamcity[${infer MessageName} ${infer Attrs}]`
    ? { messageName: MessageName; attrs: ExtractAttributeKeys<Attrs> }
    : never

export type MessageNameToTypeMap = {
  [K in Messages['messageName']]: Extract<Messages, { messageName: K }>
}

export type MessageTypeForLogLine<Line> = Line extends IsLiteral<Line>
  ? UnpackMessageString<Line>['messageName'] extends keyof MessageNameToTypeMap
    ? InstanceFromClass<
        MessageNameToTypeMap[UnpackMessageString<Line>['messageName']]
      >
    : UnpackMessageString<Line>['attrs'] extends never
    ? InstanceFromClass<typeof TcSingleAttributeMessage>
    : InstanceFromClass<
        typeof TcMultiAttributeMessage<UnpackMessageString<Line>['attrs']>
      >
  : Messages
