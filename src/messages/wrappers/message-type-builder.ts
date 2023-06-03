import z, { ZodSchema } from 'zod'
import { MessageValidationError } from './errors.js'
import {
  Message,
  MultiAttributeMessage,
  SingleAttributeMessage,
} from '../types.js'
import type { MessageTypeRepository } from '../repos/message-type-repository.js'
import validators, {
  InferValidatorType,
  MessageValidator,
  MultiAttributeMessageValidator,
} from './schema-utils.js'

export interface MessageTypeOpts<MessageName extends string = string> {
  /**
   * The name of the message that is usually found in the first part of the paramaters block in a service message log line.
   * @see {@link https://www.jetbrains.com/help/teamcity/service-messages.html#Service+Messages+Formats | TeamCity Service Message Formats}
   **/
  messageName: MessageName
}

export interface MessageOpts {
  /**
   * The identifier of the "flow" on which this message was outputted. This is to support parsers in order to understand
   * situations where multiple parallel executions are outputting to a single stream. Leaving it undefined equates to the message
   * being in the "root" flow.
   *
   * @see {@link https://www.jetbrains.com/help/teamcity/service-messages.html#Message+FlowId | TeamCity Message FlowId}
   */
  flowId?: string
}

interface ValueAccessorMethods<ValueType> {
  /**
   * This function is called internally when a consumer accesses the value.
   *
   * @param rawValue The underlying serialised string that represents this value.
   * @returns The desired representation of `rawValue` (deserialised).
   */
  fromString: (rawValue: string | undefined) => ValueType
  /**
   * This function is called internally when a consumer sets the value.
   *
   * @param value The desired representation of `rawValue` (deserialised).
   * @returns The underlying serialised string that represents this value.
   */
  toString: (value: ValueType) => string
}

function createMessage<MessageName extends string = string>({
  messageName,
  flowId,
}: MessageOpts & MessageTypeOpts<MessageName>): Message<MessageName> {
  return {
    flowId: () => flowId,
    messageName: () => messageName,
  }
}

type ValueAccessorOpt<ValueType> = {
  /**
   * All messages store values as strings, as that is the only type they can exist in a serialised log output.
   * If desired, the representation that the consumer of the message accessed can differ from the underlying string type,
   * but to do so, you must define the bidirectional serlisation/deserialisation behaviour.
   *
   * By default, string is used for the representation, which means this does not usually have to be defined.
   */
  accessor?: ValueAccessorMethods<ValueType>
}

type ValueAccessorOpts<ValueType> = ValueType extends string
  ? ValueAccessorOpt<ValueType>
  : Required<ValueAccessorOpt<ValueType>>

export type SingleAttributeMessageTypeOpts<
  ValueType,
  MessageName extends string
> = MessageTypeOpts<MessageName> & {
  /**
   * The validation function for this message. If the object is not valid, it must throw a
   * {@link MessageValidationError}.
   *
   * @param rawValue The underlying raw string value
   * @returns If validation was successful.
   * @throws A {@link MessageValidationError}
   */
  validate?: (rawValue: string | undefined) => boolean
} & ValueAccessorOpts<ValueType>

export type SingleAttributeMessageOpts = MessageOpts & {
  /**
   * The raw string representation of the initial value. Or `undefined` if unset.
   */
  rawValue?: string
}

export function createSingleAttributeMessage<
  ValueType = string,
  MessageName extends string = string
>({
  messageName,
  rawValue,
  flowId,
  validate,
  accessor,
}: SingleAttributeMessageOpts &
  SingleAttributeMessageTypeOpts<
    ValueType,
    MessageName
  >): SingleAttributeMessage<ValueType, MessageName> {
  let _value = rawValue
  let message = createMessage<MessageName>({
    messageName,
    flowId,
  })

  const singleAttrMessage: SingleAttributeMessage<ValueType, MessageName> = {
    ...message,
    getRawValue: () => _value,
    setRawValue(rawValue) {
      _value = rawValue
      return singleAttrMessage
    },
    getValue() {
      return accessor?.fromString(_value!) ?? (_value as ValueType)
    },
    setValue(value) {
      _value = accessor?.toString(value) ?? (value as string)
      return singleAttrMessage
    },
    validate() {
      try {
        if (_value === undefined)
          throw new MessageValidationError(
            'No value was specified, which is required in single attribute messages.'
          ).withMessage(singleAttrMessage)

        try {
          validate?.(_value)
        } catch (e) {
          if (e instanceof MessageValidationError) {
            throw e.withMessage(singleAttrMessage)
          }
        }

        return singleAttrMessage
      } catch (e) {
        throw e
      }
    },
  }

  return singleAttrMessage
}

type NonStringKeys<T> = {
  [K in keyof T]: T[K] extends string ? never : K
}[keyof T]

type OptionalKeys<T, Keys extends string> = Exclude<
  keyof T | Keys,
  NonStringKeys<T>
>

type MandatoryAttributeAccessMethods<T> = {
  [K in NonStringKeys<T>]: ValueAccessorMethods<T[K]>
}

type OptionalAttributeAccessMethods<T, Keys extends string> = {
  [K in OptionalKeys<T, Keys>]?: ValueAccessorMethods<string>
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
> = {
  /**
   * All messages store values as strings, as that is the only type they can exist in a serialised log output.
   * If desired, the representation that the consumer of the message accessed can differ from the underlying string type,
   * but to do so, you must define the bidirectional serlisation/deserialisation behaviour.
   *
   * By default, string is used for the representation, which means this does not usually have to be defined.
   */
  accessors?: AttributeAccessor<Keys, AttributeTypes>
}

type AttributeAccessorOpts<
  Keys extends string,
  AttributeTypes extends Partial<Record<Keys, any>>
> = AttributeTypes extends Partial<Record<Keys, string>>
  ? AttributeAccessorOpt<Keys, AttributeTypes>
  : Required<AttributeAccessorOpt<Keys, AttributeTypes>>

export type MultiAttributeMessageTypeOpts<
  MessageName extends string,
  Keys extends string,
  AttributeTypes extends Partial<Record<Keys, any>> = Partial<
    Record<Keys, string>
  >
> = MessageTypeOpts<MessageName> & {
  /**
   * A `Set` of strings that represents the list of possible valid attribute names for this
   * message.
   */
  keys: Readonly<Set<Keys>>

  /**
   * The validation function for this message. If the object is not valid, it must throw a
   * {@link MessageValidationError}.
   *
   * @param rawKwargs The underlying raw string values for each attribute
   * @returns If validation was successful.
   * @throws A {@link MessageValidationError}
   */
  validate?: (
    rawKwargs: Partial<Record<Keys & ({} | string), string>>
  ) => boolean
  validationSchema?: (schema: ZodSchema) => any
} & AttributeAccessorOpts<Keys, AttributeTypes>

export type MultiAttributeMessageOpts<Keys extends string> = MessageOpts & {
  /**
   * An object literal mapping the attribute names (keys) to their initial string value in the form of the raw underlying string,
   * or `undefined` if a given attribute is unset. At this stage, any validator that has been applied is not executed, so the typings
   * of `rawKwargs` allow any input object as long as it is a flat object literal that maps strings representing arbitary
   * attribute names to string values. This is to allow representations of malformed messages to exist. To validate, call
   * `validate()` on a message object.
   */
  rawKwargs: Partial<Record<Keys & ({} | string), string>>
}

function isAccessorAvailableForKey<
  Keys extends string,
  AttributeTypes extends Partial<Record<Keys, any>>
>(
  key: string | number | symbol,
  accessors: AttributeAccessor<Keys, AttributeTypes>
): key is keyof AttributeAccessor<Keys, AttributeTypes> {
  return key in accessors
}

function isKnownAttributeKey<Keys extends string>(
  key: string | number | symbol,
  keys: Set<string | number | symbol>
): key is Keys {
  return keys.has(key)
}

function createMultiAttributeMessage<
  MessageName extends string,
  Keys extends string,
  ValidationSchema,
  AttributeTypes extends Partial<Record<Keys, any>> = {}
>({
  messageName,
  rawKwargs = {},
  flowId,
  accessors,
  validate,
  keys,
}: MultiAttributeMessageOpts<Keys> &
  MultiAttributeMessageTypeOpts<
    MessageName,
    Keys,
    AttributeTypes
  >): MultiAttributeMessage<MessageName, Keys, AttributeTypes> {
  let message = createMessage<MessageName>({ messageName, flowId })

  Object.keys(rawKwargs).forEach((key) => {
    if (isKnownAttributeKey(key, keys)) return
    console.warn(
      `Unknown key '${key}' was found on message of type '${messageName}'`
    )
  })

  let _rawKwargs = rawKwargs

  const multiAttributeMessage: MultiAttributeMessage<
    MessageName,
    Keys,
    AttributeTypes
  > = {
    ...message,
    setRawAttr(key, value) {
      _rawKwargs[key] = value
      return multiAttributeMessage
    },
    getRawAttr(key) {
      return _rawKwargs[key]
    },
    setAttr(key, value) {
      let valToSet = value as string
      if (accessors && isAccessorAvailableForKey(key, accessors)) {
        valToSet = accessors[key].toString(value)
      }

      _rawKwargs[key] = valToSet
      return multiAttributeMessage
    },
    getAttr(key) {
      if (accessors && isAccessorAvailableForKey(key, accessors)) {
        return accessors[key].fromString(_rawKwargs[key])
      }

      return _rawKwargs[key] as AttributeTypes[typeof key] extends never
        ? string
        : AttributeTypes[typeof key]
    },
    validate() {
      try {
        validate?.(_rawKwargs)
      } catch (e) {
        if (e instanceof MessageValidationError) {
          throw e.withMessage(multiAttributeMessage)
        }
      }

      return multiAttributeMessage
    },
  }

  return multiAttributeMessage
}

export type SingleAttributeMessageFactoryBuildOpts<
  ValueType,
  MessageName extends string
> = Omit<SingleAttributeMessageTypeOpts<ValueType, MessageName>, 'messageName'>

export type SingleAttributeMessageFactory<
  ValueType,
  MessageName extends string
> = {
  (opts: SingleAttributeMessageOpts): SingleAttributeMessage<
    ValueType,
    MessageName
  >
  /** Statically accessible property that defines for what message name this factory function handles. */
  messageName: MessageName
}

export type MultiAttributeMessageFactoryBuildOpts<
  MessageName extends string,
  Keys extends string,
  AttributeTypes extends Partial<Record<Keys, any>> = Partial<
    Record<Keys, string>
  >
> = Omit<
  MultiAttributeMessageTypeOpts<MessageName, Keys, AttributeTypes>,
  'messageName' | 'keys'
> &
  AttributeAccessorOpts<Keys, AttributeTypes>

export type MultipleAttributeMessageFactory<
  MessageName extends string,
  Keys extends string,
  RawValidationSchema,
  AttributeTypes extends Partial<Record<Keys, any>> = Partial<
    Record<Keys, string>
  >
> = {
  (opts: MultiAttributeMessageOpts<Keys>): MultiAttributeMessage<
    MessageName,
    Keys,
    AttributeTypes
  >
  /** Statically accessible property that defines for what message name this factory function handles. */
  messageName: MessageName
}

/**
 * The message type builder provides strongly typed utilities for constructing a factory that creates
 * representations of a mesage for a given service message type. Typically the resulting factory would
 * be passed to a {@link MessageTypeRepository}.
 *
 * @example
 * ```
 * const messageFactory = builder.name('messageTypeTohandle').singleAttribute().build()
 * ```
 *
 * @example
 * ```
 * const messageFactory = builder.name('messageTypeTohandle').multipleAttribute().keys(new Set('exampleAttr')).build()
 * ```
 *
 * @remarks The builder pattern is necessary for an ergonomic API here due to the inability to do partial inference
 * in TypeScript. By using this pattern, we utilise the currying workaround which ensures the user does not have to
 * define inferrable type args manually.
 */
export default {
  /**
   * Each message processed by the factory has an identifiable message name. Consuming systems will usually need to
   * know which message name the factory will handle.
   *
   * @param messageName The service message name that identifies the type of message the resulting factory will handle.
   */
  name: <MessageName extends string>(messageName: MessageName) => ({
    /**
     * Indicate the message type that this factory will handle is one which is of the multi attribute format.
     *
     * @see {@link https://www.jetbrains.com/help/teamcity/service-messages.html#Service+Messages+Formats|Teamcity Message Formats}
     */
    multipleAttribute: () => ({
      /**
       * Define the set of strings for each possible valid attribute name for the message type this factory will handle.
       *
       * @param keys The `Set` of known attribute names that this multi message handles.
       */
      keys: <const Keys extends string>(keys: Set<Keys>) => {
        return {
          validator: <ValidationSchema extends MultiAttributeMessageValidator>(
            getValidationSchema: (
              schemas: ReturnType<typeof validators.multiAttribute<Keys>>
            ) => InferValidatorType<Keys, ValidationSchema>
          ) => {
            let validationSchema = getValidationSchema(
              validators.multiAttribute<Keys>(keys)
            )

            return {
              test: () => {
                return {} as z.infer<ValidationSchema>
              },
              /**
               * Construct the factory that can be used to generate a representation of a message as defined by the chain leading up to this point.
               * @param messageTypeOpts The {@link MultiAttributeMessageFactoryBuildOpts} that defines aspects of the construct of the message type.
               * @returns A {@link MultipleAttributeMessageFactory} that handles the defined message.
               */
              build: <
                const AttributeTypes extends Partial<
                  Record<Keys, any>
                > = Partial<Record<Keys, string>>
              >(
                messageTypeOpts?: MultiAttributeMessageFactoryBuildOpts<
                  MessageName,
                  Keys,
                  AttributeTypes
                >
              ) => {
                const messageFactory: MultipleAttributeMessageFactory<
                  MessageName,
                  Keys,
                  z.infer<ValidationSchema>,
                  AttributeTypes
                > = (opts) =>
                  createMultiAttributeMessage<
                    MessageName,
                    Keys,
                    ValidationSchema,
                    AttributeTypes
                  >({
                    ...opts,
                    // Cast needed since the omit of `messageName` in `MultiAttributeMessageFactoryBuildOpts` removes `messageName`
                    // which causes TS to lose some needed context to resolve the merge.
                    ...(messageTypeOpts as MultiAttributeMessageTypeOpts<
                      MessageName,
                      Keys,
                      AttributeTypes
                    >),
                    messageName,
                    keys,
                  })

                messageFactory.messageName = messageName

                return messageFactory
              },
            }
          },
        }
      },
    }),
    /**
     * Indicate the message type that this factory will handle is one which is of the single attribute format.
     *
     * @see {@link https://www.jetbrains.com/help/teamcity/service-messages.html#Service+Messages+Formats|Teamcity Message Formats}
     */
    singleAttribute: () => ({
      /**
       * Construct the factory that can be used to generate a representation of a message as defined by the chain leading up to this point.
       * @param messageTypeOpts The {@link SingleAttributeMessageFactoryBuildOpts} that defines aspects of the construct of the message type.
       * @returns A {@link SingleAttributeMessageFactory} that handles the defined message.
       */
      build<ValueType>(
        messageTypeOpts?: SingleAttributeMessageFactoryBuildOpts<
          ValueType,
          MessageName
        >
      ) {
        const messageFactory = (opts: SingleAttributeMessageOpts) =>
          createSingleAttributeMessage<ValueType, MessageName>({
            ...opts,
            ...(messageTypeOpts as SingleAttributeMessageTypeOpts<
              ValueType,
              MessageName
            >),

            messageName,
          })

        messageFactory.messageName = messageName

        return messageFactory
      },
    }),
  }),
}
