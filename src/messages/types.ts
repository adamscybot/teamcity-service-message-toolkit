import { ZodSchema } from 'zod'
import {
  KeysOfMultiAttrSchema,
  StrictKeysOfMultiAttrSchema,
  ValidatedAttrTypeForKey,
} from './schema.js'
import {
  MultipleAttributeMessageFactory,
  SingleAttributeMessageFactory,
} from './builder.js'
import { defaultMessageTypeRepository } from './repository.js'

export interface Message<MessageName extends string> {
  /**
   * @see MessageOpts.flowId
   */
  flowId(): string | undefined
  /**
   * @see MessageTypeOpts.messageName
   */
  messageName(): MessageName

  /**
   * @returns A TC service message string that represents this message object
   */
  toServiceMessageString(): string
}

interface ValidateableMessage {
  /**
   * Perform validation on the message according to the validation function configured on the message type.
   *
   * @throws A {@link ZodError}
   * @returns The same message object that was validated.
   * @see SingleAttributeMessageTypeOpts.validate for where the validate logic is defined for a single attribute message.
   * @see MultiAttributeMessageTypeOpts.validate for where the validate logic is defined for a multi attribute message.
   */
  validate(): this
}

export interface SingleAttributeMessage<
  MessageName extends string,
  Schema extends ZodSchema
> extends Message<MessageName>,
    ValidateableMessage {
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
   * Gets the representational value of this message in the form of the type it is represented as.
   * Usually, this  is the same as the underlying raw value (a string), unless the message type
   * dictates a different type.
   *
   * @param value The representational value.
   */
  getValue(): Zod.infer<Schema>
}

export interface MultiAttributeMessage<
  MessageName extends string,
  Schema extends Readonly<ZodSchema>
> extends Message<MessageName>,
    ValidateableMessage {
  /**
   * Get the underlying string that represents the value.
   *
   * @param key The key of the attribute to get.
   * @returns The underlying raw string value for this attribute, or undefined if it was not set.
   */
  getRawAttr(key: KeysOfMultiAttrSchema<Schema>): string | undefined
  /**
   * Get the string representation of all the attributes on the message
   *
   * @returns An object that maps the attribute name to its underlying string value
   */

  getRawAttrs(): Record<string, string>
  /**
   * Set the underlying string that represents the value.
   *
   * @param key The key of the attribute to set.
   * @param rawValue The underlying raw string value for this attribute, or undefined if it was not set.
   * @returns The message object.
   */
  setRawAttr(key: KeysOfMultiAttrSchema<Schema>, rawValue: string): this
  /**
   * Gets the representational value of this message in the form of the type it is represented as in the schema.
   * Usually, this  is the same as the underlying raw value (a string), unless the message type
   * dictates a different type.
   *
   * @param key The key of the attribute to get.
   * @returns The representational value for this attribute.
   */
  getAttr<Key extends StrictKeysOfMultiAttrSchema<Schema>>(
    key: Key
  ): ValidatedAttrTypeForKey<Schema, Key>

  /**
   * Gets the representational values of this message whereby each key is the type it is represented as in the schema.
   * Usually, this  is the same as the underlying raw value (a string), unless the message type
   * dictates a different type.
   *
   * @returns An object of all the attrs on this message after being parsed by the schema.
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
  ansiPrint(): void
}

export type MessageFactory =
  | SingleAttributeMessageFactory<any, any>
  | MultipleAttributeMessageFactory<any, any>

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
