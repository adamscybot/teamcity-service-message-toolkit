import { MessageValidationError } from '../wrappers/errors.js'
import messageTypeBuilder, {
  MultiAttributeMessageFactoryBuildOpts,
  MultipleAttributeMessageFactory,
  SingleAttributeMessageFactory,
} from '../wrappers/message-type-builder.js'

type MessageFactory =
  | SingleAttributeMessageFactory<any, any>
  | MultipleAttributeMessageFactory<any, any, any>

export type MessageTypesMap<
  MessageTypes extends Readonly<Array<Readonly<MessageFactory>>>
> = {
  [K in MessageTypes[number]['messageName']]: Extract<
    MessageTypes[number],
    { messageName: K }
  >
}

export interface MessageTypeRepository<
  MessageTypes extends Readonly<Array<Readonly<MessageFactory>>>
> {
  getFactory<MessageType extends keyof MessageTypesMap<MessageTypes>>(
    key: MessageType
  ): void
}

/**
 * Create a store of message types. The message repository takes a message factory
 * produced by the message type builder. The repository provides a convenient way
 * to retrieve strongly typed message factories for a given service message name.
 *
 * @typeParam MessageTypes - A type representing an array of strongly typed message factories.
 * @param messageTypes - An array of message factories, probably produced by the message type builder.
 * @returns a repostitory
 * @example
 * const myMessageTypeRepo = messageTypeRepository([
 *    messageTypeBuilder.name('exampleMessage').singleAttribute().build(),
 * ])
 */
export const messageTypeRepository = <
  const MessageTypes extends Readonly<Array<Readonly<MessageFactory>>>
>(
  messageTypes: MessageTypes
) => {
  const _messageTypes: MessageTypesMap<MessageTypes> = Object.fromEntries(
    messageTypes.map((factory) => [factory.messageName, factory])
  ) as MessageTypesMap<MessageTypes>
  return {
    /**
     * Given a service message name that a message factory registered inside this repository handles,
     * return that factory.
     *
     * @param key - The service message name that the desired message factory handles.
     * @returns The factory stored in the repository that handles the passed in service message name.
     * @example
     * const myMessageTypeRepo = messageTypeRepository([
     *    messageTypeBuilder.name('exampleMessage').singleAttribute().build(),
     * ])
     *
     * const factory = myMessageTypeRepo.getFactory('exampleMessage')
     * cosnt exampleMessage = factory({rawValue: 'test'})
     */
    getFactory<MessageType extends keyof MessageTypesMap<MessageTypes>>(
      key: MessageType
    ) {
      return _messageTypes[key]
    },
  }
}

const buildTestMessage = <
  MessageName extends string,
  const AdditionalKeys extends string
>(
  messageName: MessageName,
  additionalKeys: Set<AdditionalKeys>,
  buildOpts: MultiAttributeMessageFactoryBuildOpts<
    MessageName,
    'name' | 'timestamp' | AdditionalKeys
  >
) => {
  return messageTypeBuilder
    .name<MessageName>(messageName)
    .multipleAttribute()
    .keys<'name' | 'timestamp' | AdditionalKeys>(
      new Set(['name', 'timestamp', ...additionalKeys])
    )
    .build()
}

export enum MessageMessageStatus {
  NORMAL = 'NORMAL',
  WARNING = 'WARNING',
  FAILURE = 'FAILURE',
  ERROR = 'ERROR',
}

/**
 * The default {@link MessageTypeRepository} containing all the base TeamCity service
 * messages.
 */
export const defaultTypeRepository = messageTypeRepository([
  messageTypeBuilder.name('buildNumber').singleAttribute().build(),
  messageTypeBuilder.name('publishArtifacts').singleAttribute().build(),
  messageTypeBuilder.name('progressMessage').singleAttribute().build(),
  messageTypeBuilder.name('progressStart').singleAttribute().build(),
  messageTypeBuilder.name('progressFinish').singleAttribute().build(),
  messageTypeBuilder
    .name('message')
    .multipleAttribute()
    .keys(new Set(['text', 'errorDetails', 'status']))
    .build<{ status: MessageMessageStatus }>({
      validate(rawKwargs) {
        if (!rawKwargs.status || !(rawKwargs.status in MessageMessageStatus))
          throw new MessageValidationError(
            `Found invalid value '${
              rawKwargs.status
            }'. Expected: ${Object.values(MessageMessageStatus)}`
          )

        return true
      },
    }),
  messageTypeBuilder
    .name('flowStarted')
    .multipleAttribute()
    .keys(new Set(['parent']))
    .build(),
  messageTypeBuilder
    .name('flowFinished')
    .multipleAttribute()
    .keys(new Set(['parent']))
    .build(),
  messageTypeBuilder
    .name('blockOpened')
    .multipleAttribute()
    .keys(new Set(['name', 'description']))
    .build(),
  messageTypeBuilder
    .name('blockClosed')
    .multipleAttribute()
    .keys(new Set(['name']))
    .build(),
  messageTypeBuilder
    .name('compilationStarted')
    .multipleAttribute()
    .keys(new Set(['compiler']))
    .build(),
  messageTypeBuilder
    .name('compilationFinished')
    .multipleAttribute()
    .keys(new Set(['compiler']))
    .build(),
  messageTypeBuilder
    .name('testSuiteStarted')
    .multipleAttribute()
    .keys(new Set(['name', 'timestamp']))
    .build(),
  messageTypeBuilder
    .name('testSuiteFinished')
    .multipleAttribute()
    .keys(new Set(['name', 'timestamp']))
    .build(),
  messageTypeBuilder
    .name('testStarted')
    .multipleAttribute()
    .keys(new Set(['name', 'timestamp', 'captureStandardOutput']))
    .build(),
  messageTypeBuilder
    .name('testFinished')
    .multipleAttribute()
    .keys(new Set(['name', 'timestamp', 'duration']))
    .build(),
  messageTypeBuilder
    .name('testIgnored')
    .multipleAttribute()
    .keys(new Set(['name', 'timestamp', 'message']))
    .build(),
  messageTypeBuilder
    .name('testFailed')
    .multipleAttribute()
    .keys(
      new Set([
        'name',
        'timestamp',
        'message',
        'details',
        'expected',
        'actual',
        'type',
      ])
    )
    .build(),
  messageTypeBuilder
    .name('testStdOut')
    .multipleAttribute()
    .keys(new Set(['name', 'timestamp', 'out']))
    .build(),
  messageTypeBuilder
    .name('testStdErr')
    .multipleAttribute()
    .keys(new Set(['name', 'timestamp', 'out']))
    .build(),
  messageTypeBuilder
    .name('testRetrySupport')
    .multipleAttribute()
    .keys(new Set(['enabled']))
    .build<{ enabled: boolean }>({
      validate(rawKwargs) {
        if (rawKwargs.enabled !== 'true' && rawKwargs.enabled !== 'false')
          throw new MessageValidationError(
            `Found invalid value '${rawKwargs.enabled}'. Expected 'true' or 'false'`
          )

        return true
      },
      accessors: {
        enabled: {
          fromString(value) {
            return Boolean(value)
          },
          toString(value) {
            return String(value)
          },
        },
      },
    }),
])

defaultTypeRepository
  .getFactory('compilationFinished')({ rawKwargs: { compiler: 'test' } })
  .validate()
