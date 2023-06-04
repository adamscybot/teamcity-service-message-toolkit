import {
  SingleAttributeMessageTypeOpts,
  MultiAttributeMessageTypeOpts,
  MessageOpts,
} from './builder.js'

export interface Message<MessageName extends string = string> {
  /**
   * @see MessageOpts.flowId
   */
  flowId(): string | undefined
  /**
   * @see MessageTypeOpts.messageName
   */
  messageName(): MessageName
}

interface ValidateableMessage {
  /**
   * Perform validation on the message according to the validation function configured on the message type.
   *
   * @throws A {@link MessageValidationError}
   * @returns The same message object that was validated.
   * @see SingleAttributeMessageTypeOpts.validate for where the validate logic is defined for a single attribute message.
   * @see MultiAttributeMessageTypeOpts.validatefor where the validate logic is defined for a multi attribute message.
   */
  validate(): this
}

export interface SingleAttributeMessage<
  ValueType,
  MessageName extends string = string
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
  /**
   * Set the representational value of this message, using the type it is represented as. Usually, this
   * is the same as the underlying raw value (a string), unless the message type
   * dictates a different type.
   *
   * @param value The new representational value to set
   * @returns The message object.
   */
  setValue(value: ValueType): this
  /**
   * Gets the representational value of this message in the form of the type it is represented as.
   * Usually, this  is the same as the underlying raw value (a string), unless the message type
   * dictates a different type.
   *
   * @param value The representational value.
   */
  getValue(): ValueType
}

export interface MultiAttributeMessage<
  MessageName extends string,
  Keys extends string,
  AttributeTypes extends Partial<Record<Keys, any>> = {}
> extends Message<MessageName>,
    ValidateableMessage {
  /**
   * Get the underlying string that represents the value.
   *
   * @param key The key of the attribute to get.
   * @returns The underlying raw string value for this attribute, or undefined if it was not set.
   */
  getRawAttr(key: Keys & ({} | string)): string | undefined
  /**
   * Set the underlying string that represents the value.
   *
   * @param key The key of the attribute to set.
   * @param rawValue The underlying raw string value for this attribute, or undefined if it was not set.
   * @returns The message object.
   */
  setRawAttr(key: Keys & ({} | string), rawValue: string): this
  /**
   * Gets the representational value of this message in the form of the type it is represented as.
   * Usually, this  is the same as the underlying raw value (a string), unless the message type
   * dictates a different type.
   *
   * @param key The key of the attribute to get.
   * @returns The representational value for this attribute.
   */
  getAttr<Key extends Keys>(
    key: Key
  ): AttributeTypes[Key] extends never ? string : AttributeTypes[Key]
  /**
   * Set the representational value of this message, using the type it is represented as. Usually, this
   * is the same as the underlying raw value (a string), unless the message type
   * dictates a different type.
   *
   * @param key The key of the attribute to set.
   * @param value The new representational value to set for this attribute.
   * @returns The message object.
   */
  setAttr<Key extends Keys>(
    key: Key,
    value: AttributeTypes[Key] extends never ? string : AttributeTypes[Key]
  ): this
}
