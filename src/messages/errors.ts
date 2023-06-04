import { CustomError } from 'ts-custom-error'
import {
  Message,
  MultiAttributeMessage,
  SingleAttributeMessage,
} from './types.js'

export class MessageValidationError extends CustomError {
  public constructor(reason: string, message?: Message) {
    super(`Message validation failure. Reason: ${reason}`)
  }

  public withMessage<
    MessageType extends
      | SingleAttributeMessage<any, any>
      | MultiAttributeMessage<any, any, any>
  >(message: MessageType) {
    this.message += ` Message: ${message}`
    return this
  }
}
