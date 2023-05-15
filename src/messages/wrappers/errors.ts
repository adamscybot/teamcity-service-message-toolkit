import { CustomError } from 'ts-custom-error'
import { TcBaseMessageInterface } from '../types.js'

export class MessageValueAccessWhilstUnvalidated extends CustomError {
  public constructor(message: TcBaseMessageInterface<any>, key?: string) {
    super(
      `Attemtped to access ${
        key === undefined ? '' : `'${key}' `
      } value on ${message} without first calling 'validate()'. The validate function must be called again if a setter was called. Call the validate function or use the other available methods to access the raw underlying values.`
    )
  }
}

export class MessageValidationError extends CustomError {
  public constructor(message: TcBaseMessageInterface<any>, reason: string) {
    super(`Message '${message}' failed validation. Reason: ${reason}`)
  }
}
