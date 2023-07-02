import { ZodError, ZodSchema, z } from 'zod'
import { Chalk } from 'chalk'
import {
  Message,
  MultiAttributeMessage,
  SingleAttributeMessage,
} from './types.js'
import type { MessageTypeRepository } from './types.js'
import schemaBuilder, {
  InferMultiAttributeMessageSchema,
  RawKwargsOfMultiAttrSchema,
} from './schema.js'
import {
  formatMultiAttrServiceMessage,
  formatSingleAttrServiceMessage,
} from '../lib/format.js'

let util: typeof import('util')

if (
  typeof process !== 'undefined' &&
  process.versions &&
  process.versions.node
) {
  util = await import('util')
}

const chalk = new Chalk({ level: 2 })

export interface MessageTypeOpts<MessageName extends string = string> {
  /**
   * The name of the message that is usually found in the first part of the paramaters block in a service message log line.
   * @see {@link https://www.jetbrains.com/help/teamcity/service-messages.html#Service+Messages+Formats | TeamCity Service Message Formats}
   **/
  messageName: MessageName

  toServiceMessageString(): string
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

function createMessage<MessageName extends string = string>({
  messageName,
  flowId,
  toServiceMessageString,
}: MessageOpts & MessageTypeOpts<MessageName>): Message<MessageName> {
  return {
    flowId: () => flowId,
    messageName: () => messageName,
    toServiceMessageString,
  }
}

export type SingleAttributeMessageTypeOpts<
  MessageName extends string,
  Schema extends ZodSchema
> = Omit<
  MessageTypeOpts<MessageName>,
  'toServiceMessageString' | 'toFriendlystring'
> & {
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
    toServiceMessageString: () =>
      formatSingleAttrServiceMessage(messageName, _value, flowId),
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
> = Omit<MessageTypeOpts<MessageName>, 'toServiceMessageString'> & {
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
  let validatedKwargs: Zod.infer<Schema> | null = null
  let zodErrors: ZodError | null = null
  let _rawKwargs = rawKwargs

  let message = createMessage<MessageName>({
    messageName,
    flowId,
    toServiceMessageString: () =>
      formatMultiAttrServiceMessage(messageName, _rawKwargs, flowId),
  })

  const multiAttributeMessage: MultiAttributeMessage<MessageName, Schema> = {
    ...message,
    setRawAttr(key, value) {
      validatedKwargs = null
      zodErrors = null
      _rawKwargs[key] = value
      return multiAttributeMessage
    },
    getRawAttr(key) {
      return _rawKwargs[key]
    },
    getRawAttrs() {
      return _rawKwargs
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
    getAttrs() {
      if (validatedKwargs === null) this.validate()
      return validatedKwargs!
    },
    validate() {
      try {
        validatedKwargs = schema.parse(rawKwargs)
        zodErrors = null
      } catch (e) {
        validatedKwargs == null
        if (e instanceof ZodError) {
          zodErrors = e
        }
        throw e
      }

      return multiAttributeMessage
    },
    ansiPrint() {
      if (zodErrors) console.log(JSON.stringify(zodErrors))
      return console.log(
        `${chalk.bgAnsi256(24).ansi256(15)(`[${messageName}]`)} ${
          validatedKwargs === null
            ? zodErrors === null
              ? chalk.bgAnsi256(102).ansi256(15)(`➖ UNVALIDATED `)
              : `${chalk.bgAnsi256(217).ansi256(15)(
                  `❌ INVALID (${zodErrors.issues
                    .map((error) => `${error.path.join('.')}: ${error.message}`)
                    .join(', ')}) `
                )}`
            : chalk.bgAnsi256(34).ansi256(15)(`✅ VALIDATED `)
        } ${chalk.bgAnsi256(212).ansi256(15)(
          ` 🪢  FLOW: ${this.flowId() ?? '<root>'} `
        )}  •  ${Object.entries(this.getRawAttrs())
          .reduce<string[]>(
            (attrStrings, [name, value]) => [
              ...attrStrings,

              `${chalk.bgAnsi256(105).ansi256(15)(`🏷️  ${name}: `)}${
                validatedKwargs !== null &&
                //@ts-ignore
                validatedKwargs.hasOwnProperty(name)
                  ? chalk.bgAnsi256(105).ansi256(15)(
                      //@ts-ignore
                      validatedKwargs[name] + ' '
                    )
                  : chalk.bgAnsi256(105).ansi256(15)(`<unavailable> `)
              }${chalk.bgAnsi256(97).ansi256(15)(
                ` (raw: ${JSON.stringify(value)}) `
              )}`,
            ],
            []
          )
          .join('  •  ')}`
      )
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
