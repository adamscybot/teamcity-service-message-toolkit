import { CustomError } from 'ts-custom-error'
import { MessageFactory, MessageTypeRepository } from '../messages/types.js'
import { factory } from 'typescript'

/**
 * Error type thrown when the user attempted to retrieve a message type that was
 * not registered in the repostiory.
 */
export class MissingMessageTypeInRepository extends CustomError {
  public constructor(
    repository: MessageTypeRepository<Readonly<Array<MessageFactory>>>,
    messageName: string
  ) {
    super(
      `Can't find registered message in repository for message name: '${messageName}'. Available message types include: ${Object.values(
        repository.getFactories()
      ).map((factory) => factory.messageName)}.`
    )
  }
}

/**
 * Error type thrown when the user attempted to reference a message type that
 * has not yet been registered.
 */
export class InvalidMesageTypeRef extends CustomError {
  public constructor(factories: Readonly<Array<MessageFactory>>, ref: string) {
    super(
      `Can't resolve reference \`${ref}\` to a message factory as the reference could not be found. Did you ensure the ref was used after the referenced message type was declared? Available message types at this point in the execution include: ${factories.map(
        (factory) => factory.messageName
      )}.`
    )
  }
}

export enum InvalidServiceMessageFormatReasons {
  MISSING_IDENT = 'MISSING_IDENT',
  INVALID_PARAMETERS = 'INVALID_PARAMETERS',
  VALUE_REQUIRES_QUOTES = 'VALUE_REQUIRES_QUOTES',
}

const INVALID_SERVICE_MESSAGE_FORMAT_MESSAGES: Record<
  InvalidServiceMessageFormatReasons,
  string
> = {
  MISSING_IDENT:
    'Message does not start with service message ident `##teamcity`',
  INVALID_PARAMETERS:
    'The paramaters usually enclosed by `[` and `]` were not found or were improperly enclosed. Additionally ensure there is no space after the ident and before the first opening `[`',
  VALUE_REQUIRES_QUOTES: 'All values must be wrapped in single quotes.',
}

/** Error type thrown when */
export class InvalidServiceMessageFormat extends CustomError {
  public readonly reason: InvalidServiceMessageFormatReasons
  public readonly line: string

  public constructor(
    line: string,
    reason: InvalidServiceMessageFormatReasons,
    additionalContext?: string
  ) {
    super(
      `The following line was unable to be parsed as a service mesage: '${line}'. Reason: ${
        INVALID_SERVICE_MESSAGE_FORMAT_MESSAGES[reason]
      } ${additionalContext ? `Further Detail: ${additionalContext}` : ''}`
    )
    this.reason = reason
    this.line = line
  }
}
