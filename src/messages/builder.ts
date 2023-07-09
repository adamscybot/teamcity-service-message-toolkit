import { ZodError, ZodSchema, z } from 'zod'
import { Chalk } from 'chalk'

import type {
  Message,
  MultiAttributeMessage,
  SingleAttributeMessage,
  ContextualMessage,
  MessageFactory,
  MessageTypeRepository,
  MessageTypeRepositoryRef,
  MessageTypeRepositoryBuilder,
  ExtractSchemaFromMessageFactory,
  ValidBlockContextKeys,
} from './types.js'
import schemaBuilder, {
  InferMultiAttributeMessageSchema,
  RawKwargsOfMultiAttrSchema,
} from './schema.js'
import {
  formatMultiAttrServiceMessage,
  formatSingleAttrServiceMessage,
} from '../lib/format.js'
import { isMultiAttributeMessage, isSingleAttributeMessage } from './utils.js'

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
   * The name of the message that is usually found in the first part of the
   * paramaters block in a service message log line.
   *
   * @see {@link https://www.jetbrains.com/help/teamcity/service-messages.html#Service+Messages+Formats | TeamCity Service Message Formats}
   */
  messageName: MessageName

  toServiceMessageString(): string
}

export interface MessageOpts {
  /**
   * The identifier of the "flow" on which this message was outputted. This is
   * to support parsers in order to understand situations where multiple
   * parallel executions are outputting to a single stream. Leaving it undefined
   * equates to the message being in the "root" flow.
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
  Schema extends ZodSchema,
  BlockContextCloseFactory extends MessageFactory | undefined = undefined
> = Omit<
  MessageTypeOpts<MessageName>,
  'toServiceMessageString' | 'toFriendlystring'
> & {
  schema: Schema

  blockContextOpts?: {
    closeFactory: BlockContextCloseFactory
  } & MessageTypeBuilderSingleEndsWithOpts
}

export type SingleAttributeMessageOpts = MessageOpts & {
  /**
   * The raw string representation of the initial value. Or `undefined` if
   * unset.
   */
  rawValue?: string
}

export function createSingleAttributeMessage<
  MessageName extends string,
  Schema extends ZodSchema,
  BlockContextCloseFactory extends MessageFactory | undefined = undefined
>({
  messageName,
  rawValue,
  flowId,
  schema,
  blockContextOpts,
}: SingleAttributeMessageOpts &
  SingleAttributeMessageTypeOpts<
    MessageName,
    Schema,
    BlockContextCloseFactory
  >): SingleAttributeMessage<MessageName, Schema, BlockContextCloseFactory> {
  let _value = rawValue
  let validatedValue: Zod.infer<Schema> | null = null
  let zodErrors: ZodError | null = null

  let message = createMessage<MessageName>({
    messageName,
    flowId,
    toServiceMessageString: () =>
      formatSingleAttrServiceMessage(messageName, _value, flowId),
  })

  const singleAttrMessage: SingleAttributeMessage<
    MessageName,
    Schema,
    BlockContextCloseFactory
  > = {
    ...message,
    syntaxType() {
      return 'singleAttr'
    },
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
      try {
        validatedValue = schema.parse(rawValue)
        zodErrors = null
      } catch (e) {
        validatedValue == null
        if (e instanceof ZodError) {
          zodErrors = e
        }
        throw e
      }

      return singleAttrMessage
    },

    ansi() {
      const seperator = chalk.bgAnsi256(253)('')
      return `${chalk.bgAnsi256(24).ansi256(15)(`[${messageName}] `)}${
        validatedValue === null
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
      )} ${seperator}${chalk.bgAnsi256(105).ansi256(15)(`🏷️  value: `)}${
        validatedValue !== null
          ? //@ts-ignore
            chalk.bgAnsi256(105).ansi256(15)(
              //@ts-ignore
              validatedValue.replace('\r', '\\r').replace('\n', '\\n') + ' '
            )
          : chalk.bgAnsi256(105).ansi256(15)(`<unavailable> `)
      }${chalk.bgAnsi256(97).ansi256(15)(` (raw: ${JSON.stringify(_value)}) `)}`
    },

    isContextBlock() {
      return blockContextOpts?.closeFactory !== undefined
    },

    getBlockTerminatorFactory() {
      return blockContextOpts?.closeFactory as BlockContextCloseFactory
    },

    isMessageBlockTerminator(targetMessage) {
      const targetEndFactory = this.getBlockTerminatorFactory()

      // This message isn't a block context start message so there is no reason to compare.
      if (!targetEndFactory) return false

      const messageMatch =
        targetMessage.messageName() === targetEndFactory.messageName

      // Different message name means not match
      if (!messageMatch) return false

      // If no block key is set we just need to compare the message names
      if (!blockContextOpts?.useValueAsBlockKey) {
        return messageMatch
      }

      // If the `useValueAsBlockKey` was set and the message to compare against is not a single attr message, then it can never match
      if (targetEndFactory.syntaxType === 'multiAttr') {
        return false
      }

      // `useValueAsBlockKey` is set, and the expected end message is also a single attr message. Check value match.
      if (isSingleAttributeMessage(targetMessage)) {
        return targetMessage.getRawValue() === this.getRawValue()
      }

      // Unknown bad state
      return false
    },
  }

  return singleAttrMessage
}

export type MultiAttributeMessageTypeOpts<
  MessageName extends string,
  Schema extends Readonly<ZodSchema>,
  BlockContextCloseFactory extends MessageFactory | undefined = undefined,
  BlockContextKey extends ValidBlockContextKeys<
    Schema,
    BlockContextCloseFactory
  > = undefined
> = Omit<MessageTypeOpts<MessageName>, 'toServiceMessageString'> & {
  /**
   * A `Set` of strings that represents the list of possible valid attribute
   * names for this message.
   */
  schema: Schema

  blockContextOpts?: {
    closeFactory: BlockContextCloseFactory
    blockKey?: BlockContextKey
  }
}

export type MultiAttributeMessageOpts<Schema extends Readonly<ZodSchema>> =
  MessageOpts & {
    /**
     * An object literal mapping the attribute names (keys) to their initial
     * string value in the form of the raw underlying string, or `undefined` if
     * a given attribute is unset. At this stage, any validator that has been
     * applied is not executed, so the typings of `rawKwargs` allow any input
     * object as long as it is a flat object literal that maps strings
     * representing arbitary attribute names to string values. This is to allow
     * representations of malformed messages to exist. To validate, call
     * `validate()` on a message object.
     */
    rawKwargs: RawKwargsOfMultiAttrSchema<Schema>
  }

function createMultiAttributeMessage<
  MessageName extends string,
  Schema extends Readonly<ZodSchema>,
  BlockContextCloseFactory extends MessageFactory | undefined = undefined,
  BlockContextKey extends
    | ValidBlockContextKeys<Schema, BlockContextCloseFactory>
    | undefined = undefined
>({
  messageName,
  rawKwargs = {},
  flowId,
  schema,
  blockContextOpts,
}: MultiAttributeMessageOpts<Schema> &
  MultiAttributeMessageTypeOpts<
    MessageName,
    Schema,
    BlockContextCloseFactory,
    BlockContextKey
  >): MultiAttributeMessage<
  MessageName,
  Schema,
  BlockContextCloseFactory,
  BlockContextKey
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

  const multiAttributeMessage: MultiAttributeMessage<
    MessageName,
    Schema,
    BlockContextCloseFactory,
    BlockContextKey
  > = {
    ...message,
    syntaxType() {
      return 'multiAttr'
    },
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
    ansi() {
      const seperator = ''
      return `${chalk.bgAnsi256(24).ansi256(15)(`[${messageName}] `)}${
        validatedKwargs === null
          ? zodErrors === null
            ? chalk.bgAnsi256(102).ansi256(15)(`➖ UNVALIDATED `)
            : `${chalk.bgAnsi256(217).ansi256(15)(
                `❌ INVALID (${zodErrors.issues
                  .map((error) => `${error.path.join('.')}: ${error.message}`)
                  .join(', ')}) `
              )}`
          : chalk.bgAnsi256(34).ansi256(15)(`✅ VALIDATED `)
      }${seperator}${chalk.bgAnsi256(212).ansi256(15)(
        ` 🪢  FLOW: ${this.flowId() ?? '<root>'} `
      )}${seperator}${Object.entries(this.getRawAttrs())
        .reduce<string[]>(
          (attrStrings, [name, value]) => [
            ...attrStrings,

            `${chalk.bgAnsi256(105).ansi256(15)(`🏷️  ${name}: `)}${
              validatedKwargs !== null &&
              //@ts-ignore
              validatedKwargs.hasOwnProperty(name)
                ? chalk.bgAnsi256(105).ansi256(15)(
                    //@ts-ignore
                    validatedKwargs[name]
                      .replace('\r', '\\r')
                      .replace('\n', '\\n') + ' '
                  )
                : chalk.bgAnsi256(105).ansi256(15)(`<unavailable> `)
            }${chalk.bgAnsi256(97).ansi256(15)(
              ` (raw: ${JSON.stringify(value)}) `
            )}`,
          ],
          []
        )
        .join(seperator)}`
    },

    isContextBlock() {
      return blockContextOpts?.closeFactory !== undefined
    },

    getBlockTerminatorFactory() {
      return blockContextOpts?.closeFactory as BlockContextCloseFactory
    },

    isMessageBlockTerminator(targetMessage) {
      const targetEndFactory = this.getBlockTerminatorFactory()

      // This message isn't a block context start message so there is no reason to compare.
      if (!targetEndFactory) return false

      const messageMatch =
        targetMessage.messageName() === targetEndFactory.messageName

      // Different message name means not match
      if (!messageMatch) return false

      // If no block key is set we just need to compare the message names
      if (blockContextOpts?.blockKey === undefined) {
        return messageMatch
      }

      // If the `blockKey` was set and the message to compare against is not a multi attr message, then it can never match
      if (targetEndFactory.syntaxType === 'singleAttr') {
        return false
      }

      // `blockKey` is set, and the expected end message is also a multi attr message. Check attribute match.
      if (isMultiAttributeMessage(targetMessage)) {
        return blockContextOpts.blockKey.every(
          (key) => targetMessage.getRawAttr(key) === this.getRawAttr(key)
        )
      }

      // Unknown bad state
      return false
    },
  }

  return multiAttributeMessage
}

export type SingleAttributeMessageFactory<
  MessageName extends string,
  Schema extends ZodSchema,
  BlockContextCloseFactory extends MessageFactory | undefined = undefined
> = {
  (opts: SingleAttributeMessageOpts): SingleAttributeMessage<
    MessageName,
    Schema,
    BlockContextCloseFactory
  >
  /** Identifier that this is a single attr message. */
  syntaxType: 'singleAttr'
  /**
   * Statically accessible property that defines for what message name this
   * factory function handles.
   */
  messageName: MessageName

  /** The built schema for this message type */
  schema: Schema
}

export type MultiAttributeMessageFactoryBuildOpts<
  MessageName extends string,
  Schema extends Readonly<ZodSchema>
> = Omit<
  MultiAttributeMessageTypeOpts<MessageName, Schema>,
  'messageName' | 'blockContextOpts'
>

export type MultipleAttributeMessageFactory<
  MessageName extends string,
  Schema extends Readonly<ZodSchema>,
  BlockContextCloseFactory extends MessageFactory | undefined = undefined,
  BlockContextKey extends ValidBlockContextKeys<
    Schema,
    BlockContextCloseFactory
  > = undefined
> = {
  (opts: MultiAttributeMessageOpts<Schema>): MultiAttributeMessage<
    MessageName,
    Schema,
    BlockContextCloseFactory,
    BlockContextKey
  >
  /** Identifier that this is a multi attr message. */
  syntaxType: 'multiAttr'
  /**
   * Statically accessible property that defines for what message name this
   * factory function handles.
   */
  messageName: MessageName

  /** The built schema for this message type */
  schema: Schema
}

/**
 * @typeParam Schema - The schema of the parent message
 * @typeParam BlockContextCloseFactory - The factory that has been configured as
 *   the the one that represents the end message type.
 */
export type MessageTypeBuilderMultiEndsWithOpts<
  Schema extends ZodSchema,
  BlockContextCloseFactory extends MessageFactory
> = {
  /**
   * The block key should be set to the name of the attribute that is matched
   * against to correctly specify that the block has ended. `undefined` can be
   * used if any message with the closing message type should close the block.
   *
   * The key must exist as an attribute on the schema of both the current
   * message type being defined and the referenced message type.
   *
   * For example, in TC messages "name" is often used.
   *
   * This setting here influences methods the `isEndContextBlockMessage` method
   * on the {@link ContextualMessage} interface. If it is set, this will only
   * return `true` if a the result of calls to `getRawAttr(<blockKey>)` on both
   * messages being compared are is equal, for every defined `blockKey`.
   *
   * Note the representational value (after processing by the schema) is not
   * currently used for comparison.
   *
   * @remarks
   * Comparison via a custom matcher function, or via comparing the post-schema
   * values, may come later.
   * @defaultValue `undefined` Which means the message type of the designated end message factory will trigger the block to end, no matter the attributes.
   */
  blockKey: ValidBlockContextKeys<Schema, BlockContextCloseFactory>
}

export type MessageTypeBuilderSingleEndsWithOpts = {
  /**
   * If set to `true`, the value of the single attribute message is matched
   * against to correctly specify that the block has ended. `false` can be used
   * if any message with the closing message type should close the block.
   *
   * This setting here influences methods the `isEndContextBlockMessage` method
   * on the {@link ContextualMessage} interface. If it is set, this will only
   * return `true` if a the result of calls to `getRawValue(<blockKey>)` on both
   * messages being compared are is equal.
   *
   * Note the representational value (after processing by the schema) is not
   * currently used for comparison.
   *
   * @remarks
   * Comparison via a custom matcher function, or via comparing the post-schema
   * values, may come later.
   * @defaultValue `false`
   */
  useValueAsBlockKey?: boolean
}

/**
 * The message type builder provides strongly typed utilities for constructing a
 * factory that creates representations of a mesage for a given service message
 * type. Typically the resulting factory would be passed to a
 * {@link MessageTypeRepository}.
 *
 * @remarks
 * The builder pattern is necessary for an ergonomic API here due to the
 * inability to do partial inference in TypeScript. By using this pattern, we
 * utilise the currying workaround which ensures the user does not have to
 * define inferrable type args manually.
 * @example Create a single attribute message factory
 *
 * ```ts
 * const messageFactory = builder
 *   .name('messageTypeTohandle')
 *   .singleAttribute()
 *   .build()
 * ```
 *
 * @example Create a single attribute message factory with a custom schema
 *
 * ```ts
 * const messageFactory = builder
 *   .name('messageTypeTohandle')
 *   .singleAttribute()
 *   .schema((d) => d.optional())
 *   .build()
 * ```
 *
 * @example Create a single attribute message factory that opens a context.
 *
 * ```ts
 * const endMessage = builder.name('endMessage').singleAttribute().build()
 *
 * const startMessage = builder
 *   .name('startMessage')
 *   .singleAttribute()
 *   .endsWith(endMessage, { useValueAsBlockKey: true })
 *   .build()
 * ```
 *
 * @example Create a multi attribute message factory with a custom schema
 *
 * ```ts
 * const messageFactory = builder
 *   .name('messageTypeTohandle')
 *   .multipleAttribute()
 *   .schema((s) =>
 *     s
 *       .attribute('name')
 *       .attribute('description', (a) => a.optional())
 *       .build()
 *   )
 *   .build()
 * ```
 *
 * @example Create a multi attribute message factory that opens a context.
 *
 * ```ts
 * const endMessage = builder
 *   .name('endMessage')
 *   .multipleAttribute()
 *   .schema((s) => s.attribute('name').build())
 *   .build()
 *
 * const startMessage = builder
 *   .name('startMessage')
 *   .multipleAttribute()
 *   .schema((s) => s.attribute('name').build())
 *   .endsWith(endMessage, { blockKey: 'name' })
 *   .build()
 * ```
 *
 * @see {@link MessageTypeRepository} for how to easily construct block context pairs
 * as part of the repository builder flow.
 */
const builder = {
  /**
   * Each message processed by the factory has an identifiable message name.
   * Consuming systems will usually need to know which message name the factory
   * will handle.
   *
   * @param messageName The service message name that identifies the type of
   *   message the resulting factory will handle.
   * @returns The rest of the builder, to chain configuration.
   * @see See {@link builder} for examples
   */
  name: <MessageName extends string>(messageName: MessageName) => ({
    /**
     * Indicate the message type that this factory will handle is one which is
     * of the multi attribute format.
     *
     * @returns The rest of the builder, to chain configuration.
     * @see {@link https://www.jetbrains.com/help/teamcity/service-messages.html#Service+Messages+Formats|Teamcity Message Formats}
     * @see See {@link builder} for examples
     */
    multipleAttribute: () => ({
      /**
       * Define a schema that represents the attributes of this message. The
       * schema can also coerce/transform values so that when accessed later
       * they will be a more egonomic type.
       *
       * @param getSchema A function that is passed the `multiAttribute` schema
       *   builder from {@link schemaBuilder} and returns the a Zod schema. There
       *   is one restriction on the Zod schema and that is it must accept an
       *   object of key-value pairs.
       * @returns The rest of the builder, to chain configuration.
       * @see See {@link builder} for examples
       * @see {@link schemaBuilder} for the schema builder helpers.
       * @see https://zod.dev which powers the underlying schema. All of its expressiveness can be utilised.
       */
      schema: <Schema extends ZodSchema>(
        getSchema: (
          schemas: ReturnType<typeof schemaBuilder.multiAttribute>
        ) => InferMultiAttributeMessageSchema<Schema>
      ) => {
        let schema = getSchema(schemaBuilder.multiAttribute())

        const createSchemaTypedBuilder = <
          BlockContextCloseFactory extends MessageFactory | undefined,
          BlockContextKey extends ValidBlockContextKeys<
            Schema,
            BlockContextCloseFactory
          >
        >({
          closeFactory,
          blockKey,
        }: {
          closeFactory: BlockContextCloseFactory
          blockKey: BlockContextKey | undefined
        }) => ({
          /**
           * Specifying this option on the message type defines this message
           * type as one which is a "block", meaning it has a sister message
           * type that defines when this block as ended.
           *
           * @param factory A message factory that represents the "end" message.
           *   Typically this would be provided using the
           *   {@link MessageTypeRepositoryRef} utility that is passed as an
           *   argument to `defineMessage` when constructing a
           *   {@link MessageTypeRepository} via the
           *   {@link MessageTypeRepositoryBuilder}
           * @param opts {@link MessageTypeBuilderMultiEndsWithOpts}
           * @returns The rest of the builder, to chain configuration.
           * @see See {@link builder} for examples
           */
          endsWith: <
            ReferencedFactory extends MessageFactory,
            Opts extends MessageTypeBuilderMultiEndsWithOpts<
              Schema,
              ReferencedFactory
            >
          >(
            factory: ReferencedFactory,
            opts?: Opts
          ) => {
            return createSchemaTypedBuilder<
              ReferencedFactory,
              Opts['blockKey']
            >({
              closeFactory: factory,
              blockKey: opts?.blockKey,
            })
          },

          /**
           * Construct the factory that can be used to generate a representation
           * of a message as defined by the chain leading up to this point.
           *
           * @param messageTypeOpts The
           *   {@link MultiAttributeMessageFactoryBuildOpts} that defines aspects
           *   of the construct of the message type.
           * @returns A {@link MultipleAttributeMessageFactory} that handles the
           *   defined message.
           */
          build: (
            messageTypeOpts?: MultiAttributeMessageFactoryBuildOpts<
              MessageName,
              Schema
            >
          ) => {
            const messageFactory: MultipleAttributeMessageFactory<
              MessageName,
              Schema,
              BlockContextCloseFactory,
              BlockContextKey
            > = (opts) =>
              createMultiAttributeMessage<
                MessageName,
                Schema,
                BlockContextCloseFactory,
                BlockContextKey
              >({
                ...opts,
                // Cast needed since the omit of `messageName` in `MultiAttributeMessageFactoryBuildOpts` removes `messageName`
                // which causes TS to lose some needed context to resolve the merge.
                ...(messageTypeOpts as MultiAttributeMessageTypeOpts<
                  MessageName,
                  Schema,
                  BlockContextCloseFactory,
                  BlockContextKey
                >),
                messageName,
                schema,
                blockContextOpts: {
                  closeFactory,
                  blockKey,
                },
              })

            messageFactory.syntaxType = 'multiAttr'
            messageFactory.messageName = messageName
            messageFactory.schema = schema

            return messageFactory
          },
        })

        return createSchemaTypedBuilder({
          blockKey: undefined,
          closeFactory: undefined,
        })
      },
    }),
    /**
     * Indicate the message type that this factory will handle is one which is
     * of the single attribute format.
     *
     * @see {@link https://www.jetbrains.com/help/teamcity/service-messages.html#Service+Messages+Formats|Teamcity Message Formats}
     */
    singleAttribute: () => {
      const createSingleAttrBuilder = <
        Schema extends ZodSchema,
        BlockContextCloseFactory extends MessageFactory | undefined
      >({
        schema,
        closeFactory,
        contextOpts,
      }: {
        schema: Schema
        closeFactory: BlockContextCloseFactory
        contextOpts: MessageTypeBuilderSingleEndsWithOpts | undefined
      }) => ({
        /**
         * Define a schema that represents the single value of this message. The
         * schema can also coerce/transform values so that when accessed later
         * they will be a more egonomic type.
         *
         * By default, if this is not called, it is assumed that the single
         * value is a required string.
         *
         * @param getSchema A function that is passed the `singleAttribute`
         *   schema builder from {@link schemaBuilder} and returns the a Zod
         *   schema. There is one restriction on the Zod schema and that is it
         *   must accept a singular string primitive.
         * @returns The rest of the builder, to chain configuration.
         * @see See {@link builder} for examples
         * @see {@link schemaBuilder} for the schema builder helpers.
         * @see https://zod.dev which powers the underlying schema. All of its expressiveness can be utilised.
         */
        schema<ProvidedSchema extends ZodSchema>(
          getSchema: (
            schemas: ReturnType<typeof schemaBuilder.singleAttribute>
          ) => ProvidedSchema
        ) {
          return createSingleAttrBuilder<
            ProvidedSchema,
            BlockContextCloseFactory
          >({
            schema: getSchema(schemaBuilder.singleAttribute()),
            closeFactory,
            contextOpts,
          })
        },

        /**
         * Specifying this option on the message type defines this message type
         * as one which is a "block", meaning it has a sister message type that
         * defines when this block as ended.
         *
         * @param factory A message factory that represents the "end" message.
         *   Typically this would be provided using the
         *   {@link MessageTypeRepositoryRef} utility that is passed as an
         *   argument to `defineMessage` when constructing a
         *   {@link MessageTypeRepository} via the
         *   {@link MessageTypeRepositoryBuilder}
         * @param opts {@link MessageTypeBuilderSingleEndsWithOpts}
         * @returns The rest of the builder, to chain configuration.
         * @see See {@link builder} for examples
         */
        endsWith: <
          ReferencedFactory extends MessageFactory,
          Opts extends MessageTypeBuilderSingleEndsWithOpts
        >(
          factory: ReferencedFactory,
          opts?: Opts
        ) => {
          return createSingleAttrBuilder<Schema, ReferencedFactory>({
            schema,
            closeFactory: factory,
            contextOpts: opts,
          })
        },
        /**
         * Construct the factory that can be used to generate a representation
         * of a message as defined by the chain leading up to this point.
         *
         * @returns A {@link SingleAttributeMessageFactory} that handles the
         *   defined message.
         */
        build() {
          const messageFactory: SingleAttributeMessageFactory<
            MessageName,
            Schema
          > = (opts: SingleAttributeMessageOpts) =>
            createSingleAttributeMessage<MessageName, Schema>({
              ...opts,
              schema,
              messageName,
            })

          messageFactory.syntaxType = 'singleAttr'
          messageFactory.messageName = messageName
          messageFactory.schema = schema

          return messageFactory
        },
      })

      return createSingleAttrBuilder({
        schema: z.string(),
        closeFactory: undefined,
        contextOpts: undefined,
      })
    },
  }),
}

export type MessageTypeBuilder = typeof builder

export default builder
