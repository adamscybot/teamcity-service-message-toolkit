import { z } from 'zod'
import messageTypeBuilder, {
  CreateMessageTypeBuilder,
  MultipleAttributeMessageFactory,
  SingleAttributeMessageFactory,
  createMessageTypeBuilder,
} from './builder.js'
import schemaBuilder from './schema.js'
import { TC_STATISTICS_KEYS, TC_XML_TYPES } from './constants.js'
import { desconstructMessageString } from '../parser/string-parse.js'
import { MissingMessageTypeInRepository } from '../lib/errors.js'
import {
  MessageFactory,
  MessageFactoryForLogLine,
  MessageFactoryMap,
  MessageTypeRepository,
  MessageTypeRepositoryBuilder,
  MessageTypesMap,
} from './types.js'

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
  const MessageTypes extends Readonly<Array<MessageFactory>>
>(
  messageTypes: MessageTypes
): MessageTypeRepository<MessageTypes> => {
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
     * @throws {MissingMessageTypeInRepository} if factory not registered in this repository for this name
     * @example
     * const myMessageTypeRepo = messageTypeRepository([
     *    messageTypeBuilder.name('exampleMessage').singleAttribute().build(),
     * ])
     *
     * const factory = myMessageTypeRepo.getFactory('exampleMessage')
     * cosnt exampleMessage = factory({rawValue: 'test'})
     */
    getFactory<MessageType extends keyof MessageTypesMap<MessageTypes>>(
      messageName: MessageType
    ) {
      const factory = _messageTypes[messageName]
      if (!factory) throw new MissingMessageTypeInRepository(this, messageName)

      return factory
    },

    getFactories() {
      return Object.freeze(_messageTypes)
    },

    parseStrict<const Line extends string>(line: Line) {
      const parsed = desconstructMessageString(line)
      const factory = this.getFactory(parsed!.messageName)
      return factory({
        rawKwargs: parsed?.kwargs ?? {},
        rawValue: parsed?.value,
      }) as ReturnType<
        MessageFactoryForLogLine<
          MessageTypeRepository<MessageTypes>,
          Line,
          never
        >
      >
    },

    parse<const Line extends string>(line: Line) {
      const parsed = desconstructMessageString(line)
      const factory = this.getFactory(parsed!.messageName)
      return factory({
        rawKwargs: parsed?.kwargs ?? {},
        rawValue: parsed?.value,
      }) as ReturnType<
        MessageFactoryForLogLine<
          MessageTypeRepository<MessageTypes>,
          Line,
          never
        >
      >
    },
  }
}

function createRepositoryBuilder<BMap extends MessageFactoryMap = {}>(
  builders: BMap = {} as BMap
) {
  const repositoryBuilder: MessageTypeRepositoryBuilder<BMap> = {
    addMessageType<
      const MessageName extends string,
      const Factory extends MessageFactory
    >(
      messageFactoryCallback: (
        messageTypeBuilder: ReturnType<CreateMessageTypeBuilder<BMap>>
      ) => Factory & { messageName: MessageName }
    ) {
      const messageTypeBuilder = createMessageTypeBuilder<BMap>()
      const messageFactory = messageFactoryCallback(messageTypeBuilder)
      type UpdatedMessageFactoryMap = BMap & { [K in MessageName]: Factory }
      // @ts-ignore
      const newBuilders: UpdatedMessageFactoryMap = {
        ...builders,
        [messageFactory.messageName]: messageFactory,
      } as const
      return createRepositoryBuilder<UpdatedMessageFactoryMap>(newBuilders)
    },
  }
  return repositoryBuilder
}

const repositoryBuilder = createRepositoryBuilder()

repositoryBuilder
  .addMessageType((builder) => builder.name('yrdy').singleAttribute().build())
  .addMessageType((builder) => builder.name('test').singleAttribute().build())
  .addMessageType((builder) =>
    builder
      .name('buildNumber')
      .multipleAttribute()
      .schema((schema) => schema.attribute('test').build())
      .build()
  )

const baseTestSchema = schemaBuilder
  .multiAttribute()
  .attribute('name')
  // TODO: More strict TC-like date checks
  .attribute('timestamp', () => z.coerce.date().optional())

/**
 * The default {@link MessageTypeRepository} containing all the base TeamCity service
 * messages.
 *
 * @todo Allow configuring strictness of default validation
 */
export const defaultMessageTypeRepository = messageTypeRepository([
  messageTypeBuilder.name('buildNumber').singleAttribute().build(),
  messageTypeBuilder.name('publishArtifacts').singleAttribute().build(),
  messageTypeBuilder.name('progressMessage').singleAttribute().build(),
  messageTypeBuilder.name('progressStart').singleAttribute().build(),
  messageTypeBuilder.name('progressFinish').singleAttribute().build(),
  messageTypeBuilder.name('addBuildTag').singleAttribute().build(),
  messageTypeBuilder.name('removeBuildTag').singleAttribute().build(),

  messageTypeBuilder
    .name('enableServiceMessages')
    .singleAttribute()
    .schema((builder) => builder.default().optional())
    .build(),

  messageTypeBuilder
    .name('disableServiceMessages')
    .singleAttribute()
    .schema((builder) => builder.default().optional())
    .build(),

  messageTypeBuilder
    .name('buildProblem')
    .multipleAttribute()
    .schema((builder) =>
      builder
        .attribute('description')
        .attribute('identity', (attr) => attr.max(60).optional())
        .build()
    )
    .build(),
  messageTypeBuilder
    .name('buildStatus')
    .multipleAttribute()
    .schema((builder) =>
      builder
        .attribute('text')
        .attribute('status', (attr) => attr.optional())
        .build()
    )
    .build(),
  messageTypeBuilder
    .name('setParameter')
    .multipleAttribute()
    .schema((builder) => builder.attribute('name').attribute('value').build())
    .build(),
  messageTypeBuilder
    .name('buildStatisticValue')
    .multipleAttribute()
    .schema((builder) =>
      builder
        .attribute('key', () => z.enum(TC_STATISTICS_KEYS))
        .attribute('value', () =>
          z.coerce.number().refine(
            (n) => {
              let nStr = n.toString()

              if (n < 0) {
                nStr = nStr.substring(1)
              }
              const parts = nStr.split('.')

              if (parts.length == 2 && parts[1].length > 6) {
                return false
              }

              const totalDigits = parts.reduce(
                (acc, part) => acc + part.length,
                0
              )

              return totalDigits <= 13
            },
            {
              message:
                "Value of 'buildStatisticValue' message must be a number with no more than 13 digits. If a float, no more than 6 are allowed after the decimal point.",
            }
          )
        )
        .build()
    )
    .build(),
  messageTypeBuilder
    .name('importData')
    .multipleAttribute()
    .schema((builder) => {
      const baseImportDataSchema = builder
        .attribute('path')
        .attribute('verbose', () => z.coerce.boolean().default(false))
        .attribute('parseOutOfDate', () => z.coerce.boolean().default(false))
        .attribute('whenNoDataPublished', () =>
          z.enum(['info', 'nothing', 'warning', 'error']).default('info')
        )

      const importTypes = z.enum(TC_XML_TYPES)
      return z.union([
        baseImportDataSchema
          .attribute('type', (attr) => z.literal(importTypes.Enum.findBugs))
          .attribute('findBugsHome')
          .build(),
        baseImportDataSchema
          .attribute('type', (attr) =>
            z.literal(importTypes.Enum.dotNetCoverage)
          )
          .attribute('tool', () =>
            z.enum(['dotcover', 'partcover', 'ncover', 'ncover3'])
          )
          .build(),
        baseImportDataSchema
          .attribute('type', () =>
            importTypes.exclude([
              importTypes.Enum.findBugs,
              importTypes.Enum.dotNetCoverage,
            ])
          )
          .build(),
      ])
    })
    .build(),
  messageTypeBuilder
    .name('notification')
    .multipleAttribute()
    .schema((builder) =>
      z.union([
        builder
          .attribute('notifier', () => z.literal('slack'))
          .attribute('message')
          .attribute('sendTo')
          .attribute('connectionID', (attr) => attr.optional())
          .build(),
        builder
          .attribute('notifier', () => z.literal('email'))
          .attribute('message')
          .attribute('subject')
          .attribute('address', (attr) =>
            attr
              .transform((val: string) => val.split(','))
              .pipe(z.array(z.string()).nonempty())
          )
          .build(),
      ])
    )
    .build(),
  messageTypeBuilder
    .name('buildStop')
    .multipleAttribute()
    .schema((builder) =>
      builder
        .attribute('comment')
        .attribute('readdToQueue', () => z.coerce.boolean())
        .build()
    )
    .build(),
  messageTypeBuilder
    .name('inspectionType')
    .multipleAttribute()
    .schema((builder) =>
      builder
        .attribute('id', (attr) => attr.max(255))
        .attribute('name', (attr) => attr.max(255))
        .attribute('category', (attr) => attr.max(255))
        .attribute('description', (attr) => attr.max(4000))
        .build()
    )
    .build(),
  messageTypeBuilder
    .name('inspection')
    .multipleAttribute()
    .schema((builder) =>
      builder
        .attribute('typeId', (attr) => attr.max(255))
        .attribute('message', (attr) => attr.max(4000))
        .attribute('file', (attr) => attr.max(4000))
        .attribute('line', () => z.coerce.number().positive().int())
        // TODO: Handle allowing any "additional attribute" name instead of hardcoded SEVERITY
        .attribute('SEVERITY', () =>
          z.enum(['INFO', 'ERROR', 'WARNING', 'WEAK WARNING']).optional()
        )
        .build()
    )
    .build(),

  messageTypeBuilder
    .name('message')
    .multipleAttribute()
    .schema((builder) =>
      builder
        .attribute('text')
        .attribute('errorDetails')
        .attribute('status', () =>
          z.enum(['NORMAL', 'WARNING', 'FAILURE', 'ERROR'])
        )
        .build()
    )
    .build(),
  messageTypeBuilder
    .name('flowStarted')
    .multipleAttribute()
    .schema((builder) =>
      builder.attribute('parent', (attr) => attr.optional()).build()
    )
    .build(),
  messageTypeBuilder
    .name('flowFinished')
    .multipleAttribute()
    .schema((builder) =>
      builder.attribute('parent', (attr) => attr.optional()).build()
    )
    .build(),
  messageTypeBuilder
    .name('blockOpened')
    .multipleAttribute()
    .schema((builder) =>
      builder
        .attribute('name')
        .attribute('description', (attr) => attr.optional())
        .build()
    )
    .build(),
  messageTypeBuilder
    .name('blockClosed')
    .multipleAttribute()
    .schema((builder) => builder.attribute('name').build())
    .build(),
  messageTypeBuilder
    .name('compilationStarted')
    .multipleAttribute()
    .schema((builder) => builder.attribute('compiler').build())
    .build(),
  messageTypeBuilder
    .name('compilationFinished')
    .multipleAttribute()
    .schema((builder) => builder.attribute('compiler').build())
    .build(),
  messageTypeBuilder
    .name('testSuiteStarted')
    .multipleAttribute()
    .schema(() => baseTestSchema.build())
    .blockEndsWith('')
    .build(),
  messageTypeBuilder
    .name('testSuiteFinished')
    .multipleAttribute()
    .schema(() => baseTestSchema.build())
    .build(),
  messageTypeBuilder
    .name('testStarted')
    .multipleAttribute()
    .schema(() =>
      baseTestSchema
        .attribute('captureStandardOutput', (attr) =>
          z.coerce.boolean().default(false)
        )
        .build()
    )
    .build(),
  messageTypeBuilder
    .name('testFinished')
    .multipleAttribute()
    .schema(() =>
      baseTestSchema
        .attribute('duration', (attr) =>
          z.coerce.number().positive().int().optional()
        )
        .build()
    )
    .build(),
  messageTypeBuilder
    .name('testIgnored')
    .multipleAttribute()
    .schema(() =>
      baseTestSchema.attribute('message', (attr) => attr.optional()).build()
    )
    .build(),
  messageTypeBuilder
    .name('testFailed')
    .multipleAttribute()
    .schema(() => {
      const baseTestFailedSchema = baseTestSchema
        .attribute('message')
        .attribute('details', (attr) => attr.optional())

      return z.union([
        baseTestFailedSchema
          .attribute('type', (attr) =>
            attr.optional().refine((arg) => arg !== 'comparisonFailure')
          )
          .build(),

        baseTestFailedSchema
          .attribute('type', () => z.literal('comparisonFailure'))
          .attribute('expected', (attr) => attr.optional())
          .attribute('actual', (attr) => attr.optional())
          .build(),
      ])
    })
    .build(),
  messageTypeBuilder
    .name('testStdOut')
    .multipleAttribute()
    .schema(() => baseTestSchema.attribute('out').build())
    .build(),
  messageTypeBuilder
    .name('testStdErr')
    .multipleAttribute()
    .schema(() => baseTestSchema.attribute('out').build())
    .build(),
  messageTypeBuilder
    .name('testRetrySupport')
    .multipleAttribute()
    .schema((builder) =>
      builder.attribute('enabled', () => z.coerce.boolean()).build()
    )
    .build(),
])
