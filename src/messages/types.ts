import { ZodSchema } from 'zod'
import {
  KeysOfMultiAttrSchema,
  StrictKeysOfMultiAttrSchema,
  ValidatedAttrTypeForKey,
  MatchingAttrsInSchema,
} from './schema.js'
import type {
  MessageTypeBuilder,
  MultipleAttributeMessageFactory,
  SingleAttributeMessageFactory,
  MessageTypeBuilderMultiEndsWithOpts,
  MessageTypeBuilderSingleEndsWithOpts,
} from './builder.js'
import { defaultMessageTypeRepository } from './repository.js'

export interface Message<MessageName extends string> {
  /** @see MessageOpts.flowId */
  flowId(): string | undefined
  /** @see MessageTypeOpts.messageName */
  messageName(): MessageName

  /** @returns A TC service message string that represents this message object */
  toServiceMessageString(): string
}

interface ValidateableMessage {
  /**
   * Perform validation on the message according to the validation function
   * configured on the message type.
   *
   * @returns The same message object that was validated.
   * @throws A {@link ZodError}
   * @see SingleAttributeMessageTypeOpts.validate for where the validate logic is defined for a single attribute message.
   * @see MultiAttributeMessageTypeOpts.validate for where the validate logic is defined for a multi attribute message.
   */
  validate(): this
}

/**
 * Contextual messages are messages which begin a block context. I.e, they are
 * eventually proceeded by a sister message which closes the block context.
 *
 * These methods are always provided regardless of if the context was configured
 * on the method, since this helps make consuming code that needs to parse logs
 * easier to write.
 */
export interface ContextualMessage<
  BlockContextCloseFactory extends MessageFactory | undefined
> {
  /**
   * @returns `boolean` that is true if this message type is one that can
   *   trigger a new context, and so has a sister ending message type.
   */
  isContextBlock(): boolean

  /**
   * @returns If this message type is one which starts a block, the
   *   {@link MessageFactory} that can create the sister end message is returned.
   *   If it is not a block-starting message, it will return `undefined`.
   */
  getBlockTerminatorFactory(): BlockContextCloseFactory

  /**
   * Checks if a given message is the matching end message of this one. The
   * behaviour of this will differ depending on if this is a single or multi
   * attribute message, and depending on the configured context options when the
   * message was created.
   *
   * @param message The message that you wish to check.
   * @returns `boolean` that is true if the passed message is the matching end
   *   message, otherwise false. Will also return false if no close factory was
   *   provided in the message options.
   * @see {@link MessageTypeBuilderMultiEndsWithOpts} for details on matching logic for multi attr messages
   * @see {@link MessageTypeBuilderSingleEndsWithOpts} for details on matching logic for single attr messages
   */
  isMessageBlockTerminator(
    message:
      | MultiAttributeMessage<any, any, any, any>
      | SingleAttributeMessage<any, any, any>
  ): boolean
}

export interface SingleAttributeMessage<
  MessageName extends string,
  Schema extends ZodSchema,
  BlockContextCloseFactory extends MessageFactory | undefined
> extends Message<MessageName>,
    ValidateableMessage,
    ContextualMessage<BlockContextCloseFactory> {
  /** Message type identifier */
  syntaxType(): 'singleAttr'
  /**
   * Get the underlying string that represents the value.
   *
   * @returns The underlying raw string value, or undefined if it was not set.
   */
  getRawValue(): string | undefined
  /**
   * Set the underlying string that represents the value.
   *
   * @param rawValue The underlying raw string value, or undefined to unset.
   * @returns The message object.
   */
  setRawValue(rawValue: string | undefined): this
  // /**
  //  * Set the representational value of this message, using the type it is represented as. Usually, this
  //  * is the same as the underlying raw value (a string), unless the message type
  //  * dictates a different type.
  //  *
  //  * @param value The new representational value to set
  //  * @returns The message object.
  //  */
  // setValue(value: ValueType): this
  /**
   * Gets the representational value of this message in the form of the type it
   * is represented as. Usually, this is the same as the underlying raw value (a
   * string), unless the message type dictates a different type.
   *
   * @param value The representational value.
   */
  getValue(): Zod.infer<Schema>

  ansi(): string
}

export type ValidBlockContextKeys<
  Schema extends ZodSchema,
  BlockContextCloseFactory extends MessageFactory | undefined
> =
  | undefined
  | (BlockContextCloseFactory extends MessageFactory
      ? Array<
          MatchingAttrsInSchema<
            Schema,
            ExtractSchemaFromMessageFactory<BlockContextCloseFactory>
          >
        >
      : never)

export interface MultiAttributeMessage<
  MessageName extends string,
  Schema extends Readonly<ZodSchema>,
  BlockContextCloseFactory extends MessageFactory | undefined,
  BlockContextKey extends
    | ValidBlockContextKeys<Schema, BlockContextCloseFactory>
    | undefined
> extends Message<MessageName>,
    ValidateableMessage,
    ContextualMessage<BlockContextCloseFactory> {
  /** Message type identifier */
  syntaxType(): 'multiAttr'
  /**
   * Get the underlying string that represents the value.
   *
   * @param key The key of the attribute to get.
   * @returns The underlying raw string value for this attribute, or undefined
   *   if it was not set.
   */
  getRawAttr(key: KeysOfMultiAttrSchema<Schema>): string | undefined
  /**
   * Get the string representation of all the attributes on the message
   *
   * @returns An object that maps the attribute name to its underlying string
   *   value
   */

  getRawAttrs(): Record<string, string>
  /**
   * Set the underlying string that represents the value.
   *
   * @param key The key of the attribute to set.
   * @param rawValue The underlying raw string value for this attribute, or
   *   undefined if it was not set.
   * @returns The message object.
   */
  setRawAttr(key: KeysOfMultiAttrSchema<Schema>, rawValue: string): this
  /**
   * Gets the representational value of this message in the form of the type it
   * is represented as in the schema. Usually, this is the same as the
   * underlying raw value (a string), unless the message type dictates a
   * different type.
   *
   * @param key The key of the attribute to get.
   * @returns The representational value for this attribute.
   */
  getAttr<Key extends StrictKeysOfMultiAttrSchema<Schema>>(
    key: Key
  ): ValidatedAttrTypeForKey<Schema, Key>

  /**
   * Gets the representational values of this message whereby each key is the
   * type it is represented as in the schema. Usually, this is the same as the
   * underlying raw value (a string), unless the message type dictates a
   * different type.
   *
   * @returns An object of all the attrs on this message after being parsed by
   *   the schema.
   */
  getAttrs(): Zod.infer<Schema>
  // /**
  //  * Set the representational value of this message, using the type it is represented as. Usually, this
  //  * is the same as the underlying raw value (a string), unless the message type
  //  * dictates a different type.
  //  *
  //  * @param key The key of the attribute to set.
  //  * @param value The new representational value to set for this attribute.
  //  * @returns The message object.
  //  */
  // setAttr<Key extends StrictKeysOfMultiAttrSchema<Schema>>(
  //   key: Key,
  //   value: AttributeTypes[Key] extends never ? string : AttributeTypes[Key]
  // ): this

  ansi(): string
}

export type MessageFactory =
  | SingleAttributeMessageFactory<any, any, any>
  | MultipleAttributeMessageFactory<any, any, any, any>

export type ExtractSchemaFromMessageFactory<Factory extends MessageFactory> =
  Factory extends MultipleAttributeMessageFactory<
    infer RefMessageName,
    infer RefSchema extends ZodSchema
  >
    ? RefSchema
    : Factory extends MultipleAttributeMessageFactory<
        infer RefMessageName,
        infer RefSchema extends ZodSchema
      >
    ? RefSchema
    : never

export type MessageTypesMap<
  MessageTypes extends Readonly<Array<MessageFactory>>
> = {
  [K in MessageTypes[number]['messageName']]: Extract<
    MessageTypes[number],
    { messageName: K }
  >
}

export interface MessageTypeRepository<
  MessageTypes extends Readonly<Array<MessageFactory>>
> {
  getFactories(): MessageTypes
  getFactory<MessageType extends keyof MessageTypesMap<MessageTypes>>(
    key: MessageType
  ): MessageTypesMap<MessageTypes>[MessageType]

  parseStrict<Line extends string>(
    line: Line
  ): ReturnType<MessageFactoryForLogLine<this, Line, never>>

  parse<Line extends string>(
    line: Line
  ): ReturnType<MessageFactoryForLogLine<this, Line>>
}

export type MessageTypeRepositoryRef<
  MessageTypes extends Readonly<Array<MessageFactory>>
> = <MessageName extends keyof MessageTypesMap<MessageTypes>>(
  ref: MessageName
) => Extract<
  MessageTypes[number],
  {
    messageName: MessageName
  }
>

export type RepositoryDefineMessageCb<
  MessageTypes extends Readonly<Array<MessageFactory>>,
  NewFactory extends MessageFactory
> = /**
 * @param builder A {@link messageTypeBuilder} to construct a new message type.
 * @param ref A function that takes a `messageName` of message type already
 *   registered in the parent {@link MessageTypeRepositoryBuilder} up to this
 *   point, and returns the relevant message type for it. This is needed when
 *   linking messages, for example, the `endsWith` configuration.
 * @throws A {@link InvalidMesageTypeRef} If factory not registered in this
 *   repository for this name
 */ (
  builder: MessageTypeBuilder,
  ref: MessageTypeRepositoryRef<MessageTypes>
) => NewFactory

export type MessageTypeRepositoryBuilder<
  MessageTypes extends Readonly<Array<MessageFactory>>
> = {
  /**
   * @param messageFactoryCallback A {@link RepositoryDefineMessageCb} that
   *   provides easy access to the {@link MessageTypeBuilder} and
   *   {@link MessageTypeRepositoryRef} for linking message types together
   * @returns Another {@link MessageTypeRepositoryBuilder} for further chaining.
   */
  defineMessage<NewFactory extends MessageFactory>(
    messageFactoryCallback: RepositoryDefineMessageCb<MessageTypes, NewFactory>
  ): MessageTypeRepositoryBuilder<Readonly<[...MessageTypes, NewFactory]>>

  build(): MessageTypeRepository<MessageTypes>
}

type TrimWhitespace<S extends string> = S extends ` ${infer R}`
  ? TrimWhitespace<R>
  : S

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

export type MessageTypesFromRepository<
  Repository extends MessageTypeRepository<any>
> = Repository extends MessageTypeRepository<infer MessageTypes>
  ? MessageTypes
  : never

export type MessageNameToFactoryMap<
  Repository extends MessageTypeRepository<any>
> = {
  [K in MessageTypesFromRepository<Repository>[number]['messageName']]: Extract<
    MessageTypesFromRepository<Repository>[number],
    { messageName: K }
  >
}
type test = MessageTypesFromRepository<typeof defaultMessageTypeRepository>
type lol = MessageNameToFactoryMap<typeof defaultMessageTypeRepository>
// type test = Extract<
//   MessageTypesFromRepository<typeof defaultMessageTypeRepository>[number],
//   { messageName: 'buildNumber' }
// >

export type MessageFactoryForLogLine<
  Repository extends MessageTypeRepository<any>,
  Line extends string,
  Fallback = MessageFactory
> = UnpackMessageString<Line>['messageName'] extends keyof MessageNameToFactoryMap<Repository>
  ? MessageNameToFactoryMap<Repository>[UnpackMessageString<Line>['messageName']]
  : Fallback

type sdfsd = MessageFactoryForLogLine<
  typeof defaultMessageTypeRepository,
  "##teamcity[bkloProblem test='sad']",
  MessageFactory
>

type sads = ReturnType<sdfsd>
