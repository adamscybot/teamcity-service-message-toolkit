import zod from 'zod'
import { ApplyAttributeValueRules, TcMultiPropertyAttributeMap } from '../types'
import { MessageValidationError } from './errors'
import { Key } from 'node:readline'

interface Message {
  flowId(): string | undefined
  messageName(): string
  validate(): boolean
  isValidated(): boolean
}

interface SingleAttributeMessage<ValueType> extends Message {
  rawValue(): string | undefined
  setValue(value: ValueType): void
  getValue(): ValueType | undefined
}

interface MultiAttributeMessage<
  AttributeMap extends TcMultiPropertyAttributeMap
> extends Message {
  rawAttr(key: string, value?: string | undefined): string | undefined
  setValue<Key extends keyof AttributeMap>(
    key: Key,
    value: ApplyAttributeValueRules<AttributeMap, Key>
  ): void
  getValue<Key extends keyof AttributeMap>(
    key: Key
  ): ApplyAttributeValueRules<AttributeMap, Key>
}

function createMessage({
  messageName,
  flowId,
  validate,
}: {
  readonly messageName: string
  readonly flowId?: string
  validate: () => boolean
}): Message {
  let _validated = false

  const message = {
    flowId: () => flowId,
    messageName: () => messageName,
    validate: () => {
      if (validate?.()) {
        _validated = true
      } else {
        _validated = false
        throw new MessageValidationError(message, ``)
      }

      return _validated
    },
    isValidated: () => _validated,
  }

  return message
}
// Factory function for SingleAttributeMessage, extending Message
export function createSingleAttributeMessage<ValueType>(
  messageName: string,
  rawValue?: string,
  flowId?: string,
  validate: () => boolean,
  getValue?: () => ValueType,
  setValue?: (value: ValueType) => void
): SingleAttributeMessage<ValueType> {
  let message = createMessage({ messageName, flowId, validate })

  return {
    ...message,
    rawValue: () => rawValue,
    setValue: setValue || (() => {}),
    getValue: getValue || (() => undefined),
  }
}

type AttributeAccessorMethods<T> = {
  fromString: (value: string) => T
  toString: (value: T) => string
}

type NonStringKeys<T> = {
  [K in keyof T]: T[K] extends string ? never : K
}[keyof T]

type OptionalKeys<T, Keys extends string> = Exclude<
  keyof T | Keys,
  NonStringKeys<T>
>

type MandatoryAttributeAccessMethods<T> = {
  [K in NonStringKeys<T>]: AttributeAccessorMethods<T[K]>
}

type OptionalAttributeAccessMethods<T, Keys extends string> = {
  [K in OptionalKeys<T, Keys>]?: AttributeAccessorMethods<string>
}

type AttributeAccessor<
  Keys extends string,
  AttributeValues extends Partial<Record<Keys, any>> = Partial<
    Record<Keys, string>
  >
> = MandatoryAttributeAccessMethods<AttributeValues> &
  OptionalAttributeAccessMethods<AttributeValues, Keys>

type AttributeAccessorOpt<
  Keys extends string,
  AttributeTypes extends Partial<Record<Keys, any>>
> = { accessors?: AttributeAccessor<Keys, AttributeTypes> }

type AttributeAccessorOpts<
  Keys extends string,
  AttributeTypes extends Partial<Record<Keys, any>>
> = AttributeTypes extends Partial<Record<Keys, string>>
  ? AttributeAccessorOpt<Keys, AttributeTypes>
  : Required<AttributeAccessorOpt<Keys, AttributeTypes>>

type MultiAttributeMessageOpts<
  Keys extends string,
  AttributeTypes extends Partial<Record<Keys, any>> = Partial<
    Record<Keys, string>
  >
> = {
  messageName: string
  rawKwargs: Record<string, string>
  flowId?: string
  validate: () => boolean
} & AttributeAccessorOpts<Keys, AttributeTypes>

export function createMultiAttributeMessage<
  Keys extends string,
  AttributeTypes extends Partial<Record<Keys, any>> = {}
>({
  messageName,
  rawKwargs,
  flowId,
  accessors,
  validate,
}: MultiAttributeMessageOpts<Keys, AttributeTypes>): any {
  let message = createMessage({ messageName, flowId, validate })
  let _rawKwargs = rawKwargs

  return {
    ...message,
    rawAttr: (key: string, value?: string) => {
      if (value !== undefined) {
        _rawKwargs[key] = value
      }

      return _rawKwargs[key]
    },

    attr<Key extends keyof AttributeMap>(
      key: Key,
      value?: AttributeMap[Key]['type']
    ): this | AttributeMap[Key]['type'] | undefined {
      if (value !== undefined) {
        if (setValue) {
          setValue(key, value)
        }
        return this
      }

      if (!this.isValidated())
        throw new MessageValueAccessWhilstUnvalidated(this, key as string)

      return getValue ? getValue(key) : undefined
    },
  }
}

createMultiAttributeMessage<'test' | 'test2' | 'number', { test: 2 }>({
  messageName: 'test',
  rawKwargs: {},
  validate() {
    return true
  },
})
