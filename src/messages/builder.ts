import z, { Schema, ZodObject, ZodSchema } from 'zod'
import { MessageValidationError } from './errors.js'
import {
  Message,
  MultiAttributeMessage,
  SingleAttributeMessage,
} from './types.js'
import type { MessageTypeRepository } from './repository.js'
import schemaBuilder, {
  InferMultiAttributeMessageSchema,
  RawKwargsOfMultiAttrSchema,
} from './schema.js'

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

export type SingleAttributeMessageTypeOpts<
  MessageName extends string,
  Schema extends ZodSchema
> = MessageTypeOpts<MessageName> & {
  schema: Schema
}

export type SingleAttributeMessageOpts = MessageOpts & {
  /**
   * The raw string representation of the initial value. Or `undefined` if unset.
   */
  rawValue?: string
}

export function createSingleAttributeMessage<
  MessageName extends string,
  Schema extends ZodSchema
>({
  messageName,
  rawValue,
  flowId,
  schema,
}: SingleAttributeMessageOpts &
  SingleAttributeMessageTypeOpts<MessageName, Schema>): SingleAttributeMessage<
  MessageName,
  Schema
> {
  let _value = rawValue
  let validatedValue: Zod.infer<Schema> | null = null
  let message = createMessage<MessageName>({
    messageName,
    flowId,
  })

  const singleAttrMessage: SingleAttributeMessage<MessageName, Schema> = {
    ...message,
    getRawValue: () => _value,
    setRawValue(rawValue) {
      validatedValue = null
      _value = rawValue
      return singleAttrMessage
    },
    getValue() {
      if (validatedValue === null) this.validate()
      return validatedValue!
    },
    // setValue(value) {
    //   _value = accessor?.toString(value) ?? (value as string)
    //   return singleAttrMessage
    // },
    validate() {
      validatedValue = schema.parse(rawValue)

      return singleAttrMessage
    },
  }

  return singleAttrMessage
}

export type MultiAttributeMessageTypeOpts<
  MessageName extends string,
  Schema extends Readonly<ZodSchema>
> = MessageTypeOpts<MessageName> & {
  /**
   * A `Set` of strings that represents the list of possible valid attribute names for this
   * message.
   */
  schema: Schema
}

export type MultiAttributeMessageOpts<Schema extends Readonly<ZodSchema>> =
  MessageOpts & {
    /**
     * An object literal mapping the attribute names (keys) to their initial string value in the form of the raw underlying string,
     * or `undefined` if a given attribute is unset. At this stage, any validator that has been applied is not executed, so the typings
     * of `rawKwargs` allow any input object as long as it is a flat object literal that maps strings representing arbitary
     * attribute names to string values. This is to allow representations of malformed messages to exist. To validate, call
     * `validate()` on a message object.
     */
    rawKwargs: RawKwargsOfMultiAttrSchema<Schema>
  }

function createMultiAttributeMessage<
  MessageName extends string,
  Schema extends Readonly<ZodSchema>
>({
  messageName,
  rawKwargs = {},
  flowId,

  schema,
}: MultiAttributeMessageOpts<Schema> &
  MultiAttributeMessageTypeOpts<MessageName, Schema>): MultiAttributeMessage<
  MessageName,
  Schema
> {
  let message = createMessage<MessageName>({ messageName, flowId })
  let validatedKwargs: Zod.infer<Schema> | null = null
  let _rawKwargs = rawKwargs

  const multiAttributeMessage: MultiAttributeMessage<MessageName, Schema> = {
    ...message,
    setRawAttr(key, value) {
      validatedKwargs = null
      _rawKwargs[key] = value
      return multiAttributeMessage
    },
    getRawAttr(key) {
      return _rawKwargs[key]
    },
    // setAttr(key, value) {
    //   let valToSet = value as string
    //   if (accessors && isAccessorAvailableForKey(key, accessors)) {
    //     valToSet = accessors[key].toString(value)
    //   }

    //   _rawKwargs[key] = valToSet
    //   return multiAttributeMessage
    // },
    getAttr(key) {
      if (validatedKwargs === null) this.validate()
      return validatedKwargs![key]
    },
    validate() {
      validatedKwargs = schema.parse(rawKwargs)

      return multiAttributeMessage
    },
  }

  return multiAttributeMessage
}

export type SingleAttributeMessageFactory<
  MessageName extends string,
  Schema extends ZodSchema
> = {
  (opts: SingleAttributeMessageOpts): SingleAttributeMessage<
    MessageName,
    Schema
  >
  /** Statically accessible property that defines for what message name this factory function handles. */
  messageName: MessageName
}

export type MultiAttributeMessageFactoryBuildOpts<
  MessageName extends string,
  Schema extends Readonly<ZodSchema>
> = Omit<MultiAttributeMessageTypeOpts<MessageName, Schema>, 'messageName'>

export type MultipleAttributeMessageFactory<
  MessageName extends string,
  Schema extends Readonly<ZodSchema>
> = {
  (opts: MultiAttributeMessageOpts<Schema>): MultiAttributeMessage<
    MessageName,
    Schema
  >
  /** Statically accessible property that defines for what message name this factory function handles. */
  messageName: MessageName

  /** The built schema for this message type */
  schema: Schema
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
      schema: <Schema extends ZodSchema>(
        getSchema: (
          schemas: ReturnType<typeof schemaBuilder.multiAttribute>
        ) => InferMultiAttributeMessageSchema<Schema>
      ) => {
        let schema = getSchema(schemaBuilder.multiAttribute())

        return {
          /**
           * Construct the factory that can be used to generate a representation of a message as defined by the chain leading up to this point.
           * @param messageTypeOpts The {@link MultiAttributeMessageFactoryBuildOpts} that defines aspects of the construct of the message type.
           * @returns A {@link MultipleAttributeMessageFactory} that handles the defined message.
           */
          build: (
            messageTypeOpts?: MultiAttributeMessageFactoryBuildOpts<
              MessageName,
              Schema
            >
          ) => {
            const messageFactory: MultipleAttributeMessageFactory<
              MessageName,
              Schema
            > = (opts) =>
              createMultiAttributeMessage<MessageName, Schema>({
                ...opts,
                // Cast needed since the omit of `messageName` in `MultiAttributeMessageFactoryBuildOpts` removes `messageName`
                // which causes TS to lose some needed context to resolve the merge.
                ...(messageTypeOpts as MultiAttributeMessageTypeOpts<
                  MessageName,
                  Schema
                >),
                messageName,
                schema,
              })

            messageFactory.messageName = messageName
            messageFactory.schema = schema

            return messageFactory
          },
        }
      },
    }),
    /**
     * Indicate the message type that this factory will handle is one which is of the single attribute format.
     *
     * @see {@link https://www.jetbrains.com/help/teamcity/service-messages.html#Service+Messages+Formats|Teamcity Message Formats}
     */
    singleAttribute: () => {
      const singleAttrBuilder = <Schema extends ZodSchema>(schema: Schema) => ({
        schema<ProvidedSchema extends ZodSchema>(
          getSchema: (
            schemas: ReturnType<typeof schemaBuilder.singleAttribute>
          ) => ProvidedSchema
        ) {
          return singleAttrBuilder<ProvidedSchema>(
            getSchema(schemaBuilder.singleAttribute())
          )
        },
        /**
         * Construct the factory that can be used to generate a representation of a message as defined by the chain leading up to this point.
         * @returns A {@link SingleAttributeMessageFactory} that handles the defined message.
         */
        build() {
          const messageFactory = (opts: SingleAttributeMessageOpts) =>
            createSingleAttributeMessage<MessageName, Schema>({
              ...opts,
              schema,
              messageName,
            })

          messageFactory.messageName = messageName

          return messageFactory
        },
      })

      return singleAttrBuilder(z.string())
    },
  }),
}
