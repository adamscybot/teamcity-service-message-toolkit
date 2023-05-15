import {
  ApplyAttributeValueRules,
  TcBaseMessageInterface,
  TcBaseMultiAttributeMessageInterface,
  TcBaseSingleAttributeMessageInterface,
  TcMultiPropertyAttributeMap,
  TcMultiPropertyValidatedModifier,
} from '../types.js'
import {
  MessageValidationError,
  MessageValueAccessWhilstUnvalidated,
} from './errors.js'

export abstract class TcBaseMessage<ValidationModifier>
  implements TcBaseMessageInterface
{
  private _flowId: string | undefined = undefined
  private _validated: boolean = false

  constructor(flowId?: string) {
    this._flowId = flowId
    return this
  }

  flowId() {
    return this._flowId
  }

  messageName() {
    return (this.constructor as any)['messageName']
  }

  /**
   * Override this method with you own validation implementation. It is important
   * to ensure the concrete message return type is type narrowed to avoid any unuecessary checks
   * for `undefined` values in the consumer.
   *
   * @throws {MessageValidationError} when validation failed.
   */
  protected abstract doValidate(): this
  protected abstract doValidate<
    ValidatedModifier extends any
  >(): ValidatedModifier & this

  validate() {
    try {
      const validatedThis = this.doValidate<ValidationModifier>()
      this.setValidated(true)
      return validatedThis
    } catch (e) {
      this.setValidated(false)
      throw e
    }
  }

  protected setValidated(validated: boolean = true) {
    this._validated = validated
  }

  protected isValidated(): boolean {
    return this._validated
  }
}

export abstract class TcBaseSingleAttributeMessage<ValueType>
  extends TcBaseMessage<{ value: () => ValueType }>
  implements TcBaseSingleAttributeMessageInterface<ValueType>
{
  private _rawValue: string | undefined = undefined

  constructor(flowId?: string, rawValue?: string) {
    super(flowId)
    this._rawValue = rawValue
  }

  rawValue(value: string): this
  rawValue(): string | undefined
  rawValue(value?: string | undefined): string | undefined | this {
    if (value !== undefined) {
      this._rawValue = value
      return this
    }

    return this._rawValue
  }

  protected abstract getValue(): ValueType | undefined
  protected abstract setValue(value: ValueType): void

  value(value: ValueType): this
  value(): ValueType | undefined
  value(value?: ValueType | undefined): ValueType | undefined | this {
    if (value !== undefined) {
      this.setValue(value)
      return this
    }

    if (!this.isValidated()) throw new MessageValueAccessWhilstUnvalidated(this)
    return this.getValue()
  }
}

export class TcStringSingleAttributeMessage extends TcBaseSingleAttributeMessage<string> {
  protected override doValidate() {
    if (typeof this.value() !== 'string')
      throw new Error(
        `Value for message type '${this.messageName()}' is required but missing.`
      )

    return this
  }

  protected override getValue() {
    return this.rawValue()
  }

  protected override setValue(value: string) {
    this.rawValue(value)
    return this
  }
}

export abstract class TcBaseMultiAttributeMessage<
    AttributeMap extends TcMultiPropertyAttributeMap
  >
  extends TcBaseMessage<TcMultiPropertyValidatedModifier<AttributeMap>>
  implements TcBaseMultiAttributeMessageInterface<AttributeMap>
{
  protected _rawKwargs = {} as Record<string, string>

  constructor(
    rawKwargs: Record<string, string> = {} as Record<string, string>,
    flowId?: string
  ) {
    super(flowId)
    this._rawKwargs = rawKwargs
  }

  rawAttr(key: string, value: string): this
  rawAttr(key: string): string | undefined
  rawAttr(key: string, value?: string | undefined): string | undefined | this {
    if (value !== undefined) {
      this._rawKwargs[key] = value
      return this
    }

    return this._rawKwargs[key]
  }

  protected abstract getValue<Key extends keyof AttributeMap>(
    key: Key
  ): ApplyAttributeValueRules<AttributeMap, Key>
  protected abstract setValue<Key extends keyof AttributeMap>(
    key: Key,
    value: ApplyAttributeValueRules<AttributeMap, Key>
  ): void

  attr<Key extends keyof AttributeMap>(
    key: Key
  ): AttributeMap[Key]['type'] | undefined
  attr<Key extends keyof AttributeMap>(
    key: Key,
    value: AttributeMap[Key]['type']
  ): this
  attr<Key extends keyof AttributeMap>(
    key: Key,
    value?: AttributeMap[Key]['type']
  ): this | AttributeMap[Key]['type'] | undefined {
    if (value !== undefined) {
      this.setValue<Key>(key, value)
      return this
    }

    if (!this.isValidated())
      throw new MessageValueAccessWhilstUnvalidated(this, key as string)

    return this.getValue<Key>(key)
  }
}

class TcStringMultiAttributeMessage<
  StringAttributeMap extends Record<string, boolean>
> extends TcBaseMultiAttributeMessage<{
  [K in keyof StringAttributeMap]: {
    type: string
    required: StringAttributeMap[K]
  }
}> {
  protected override getValue<Key extends keyof StringAttributeMap>(
    key: Key
  ): ApplyAttributeValueRules<
    {
      [K in keyof StringAttributeMap]: {
        type: string
        required: StringAttributeMap[K]
      }
    },
    Key
  > {
    throw new Error('Method not implemented.')
  }
  protected override setValue<Key extends keyof StringAttributeMap>(
    key: Key,
    value: ApplyAttributeValueRules<
      {
        [K in keyof StringAttributeMap]: {
          type: string
          required: StringAttributeMap[K]
        }
      },
      Key
    >
  ): void {
    throw new Error('Method not implemented.')
  }

  protected override doValidate() {
    throw new Error('Method not implemented.')
  }
}
