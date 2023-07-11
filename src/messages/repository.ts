import { z } from 'zod'
import messageTypeBuilder, { MessageTypeBuilder } from './builder/builder.js'
import schemaBuilder from './schema.js'
import { TC_STATISTICS_KEYS, TC_XML_TYPES } from './constants.js'
import { desconstructMessageString } from '../parser/string-parse.js'
import {
  InvalidMesageTypeRef,
  MissingMessageTypeInRepository,
} from '../lib/errors.js'
import {
  MessageFactory,
  MessageFactoryForLogLine,
  MessageTypeRepository,
  MessageTypeRepositoryBuilder,
  MessageTypeRepositoryRef,
  MessageTypesMap,
} from './types.js'

/**
 * Create a store of message types. The message repository takes a message
 * factory produced by the message type builder. The repository provides a
 * convenient way to retrieve strongly typed message factories for a given
 * service message name.
 *
 * @category Message Repository
 * @example Const myMessageTypeRepo = messageTypeRepository([
 * messageTypeBuilder.name('exampleMessage').singleAttribute().build(), ])
 *
 * @typeParam MessageTypes - A type representing an array of strongly typed
 *   message factories.
 * @param messageTypes - An array of message factories, probably produced by the
 *   message type builder.
 * @returns A repostitory
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

const createRepositoryBuilder = <
  const MessageTypes extends Readonly<Array<MessageFactory>>
>(
  messageTypes: MessageTypes
) => {
  const ref: MessageTypeRepositoryRef<MessageTypes> = <
    MessageName extends keyof MessageTypesMap<MessageTypes>
  >(
    ref: MessageName
  ) => {
    const referencedBuilder = messageTypes.find(
      (builder) => builder.messageName === ref
    )
    if (!referencedBuilder) throw new InvalidMesageTypeRef(messageTypes, ref)
    return referencedBuilder as Extract<
      MessageTypes[number],
      {
        messageName: MessageName
      }
    >
  }

  const repositoryBuilder: MessageTypeRepositoryBuilder<MessageTypes> = {
    defineMessage<const Factory extends MessageFactory>(
      messageFactoryCallback: (
        builder: MessageTypeBuilder,
        ref: MessageTypeRepositoryRef<MessageTypes>
      ) => Factory
    ) {
      const messageFactory = messageFactoryCallback(messageTypeBuilder, ref)
      type UpdatedMessageTypes = Readonly<[...MessageTypes, Factory]>

      const newBuilders: UpdatedMessageTypes = [
        ...messageTypes,
        messageFactory,
      ] as const
      return createRepositoryBuilder<UpdatedMessageTypes>(newBuilders)
    },
    build() {
      return messageTypeRepository(messageTypes)
    },
  }
  return repositoryBuilder
}

/**
 * A builder which can produce a {@link MessageTypeRepository} given a set of
 * message types.
 *
 * By using the builder, you get strongly typed references when adding a message
 * with a defined message that ends its block context.
 *
 * @category Message Repository
 * @example Simple message registration
 *
 * ```ts
 * repositoryBuilder
 *   .defineMessage((builder) =>
 *     builder.name('exampleStart').singleAttribute().build()
 *   )
 *   .defineMessage((builder) =>
 *     builder.name('exampleEnd').singleAttribute().build()
 *   )
 * ```
 *
 * @example Link messages together easily
 *
 * ```ts
 * repositoryBuilder
 *   .defineMessage((builder) =>
 *     builder.name('endExampleBlock').singleAttribute().build()
 *   )
 *   .defineMessage((builder, ref) =>
 *     builder
 *       .name('startExampleBlock')
 *       .singleAttribute()
 *       .endsWith(ref('endExampleBlock'))
 *       .build()
 *   )
 * ```
 *
 * @returns {@link MessageTypeRepository} That contains message types as defined
 *   in the builder chain.
 * @see {@link messageTypeBuilder} for more examples on the options when building a message.
 */
const repositoryBuilder = createRepositoryBuilder([])

const baseTestSchema = schemaBuilder
  .multiAttribute()
  .attribute('name')
  // TODO: More strict TC-like date checks
  .attribute('timestamp', () => z.coerce.date().optional())

/**
 * The default {@link MessageTypeRepository} containing all the base TeamCity
 * service messages.
 *
 * @category Message Repository
 */
export const defaultMessageTypeRepository = repositoryBuilder
  .defineMessage((builder, ref) =>
    builder.name('buildNumber').singleAttribute().build()
  )
  .defineMessage((builder) =>
    builder.name('publishArtifacts').singleAttribute().build()
  )
  .defineMessage((builder) =>
    builder.name('progressMessage').singleAttribute().build()
  )
  .defineMessage((builder) =>
    builder.name('progressStart').singleAttribute().build()
  )
  .defineMessage((builder) =>
    builder.name('progressFinish').singleAttribute().build()
  )
  .defineMessage((builder) =>
    builder.name('addBuildTag').singleAttribute().build()
  )
  .defineMessage((builder) =>
    builder.name('removeBuildTag').singleAttribute().build()
  )
  .defineMessage((builder) =>
    builder
      .name('disableServiceMessages')
      .singleAttribute()
      .schema((builder) => builder.default().optional())
      .build()
  )
  .defineMessage((builder, ref) =>
    builder
      .name('enableServiceMessages')
      .singleAttribute()
      .schema((builder) => builder.default().optional())
      .endsWith(ref('disableServiceMessages'))
      .build()
  )
  .defineMessage((builder) =>
    builder
      .name('buildProblem')
      .multipleAttribute()
      .schema((builder) =>
        builder
          .attribute('description')
          .attribute('identity', (attr) => attr.max(60).optional())
          .build()
      )
      .build()
  )
  .defineMessage((builder) =>
    builder
      .name('buildStatus')
      .multipleAttribute()
      .schema((builder) =>
        builder
          .attribute('text')
          .attribute('status', (attr) => attr.optional())
          .build()
      )
      .build()
  )
  .defineMessage((builder) =>
    builder
      .name('setParameter')
      .multipleAttribute()
      .schema((builder) => builder.attribute('name').attribute('value').build())
      .build()
  )
  .defineMessage((builder) =>
    builder
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

      .build()
  )
  .defineMessage((builder) =>
    builder
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
      .build()
  )
  .defineMessage((builder) =>
    builder
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
      .build()
  )
  .defineMessage((builder) =>
    builder
      .name('buildStop')
      .multipleAttribute()
      .schema((builder) =>
        builder
          .attribute('comment')
          .attribute('readdToQueue', () => z.coerce.boolean())
          .build()
      )
      .build()
  )
  .defineMessage((builder) =>
    builder
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
      .build()
  )
  .defineMessage((builder) =>
    builder
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
      .build()
  )
  .defineMessage((builder) =>
    builder
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
      .build()
  )
  .defineMessage((builder) =>
    builder
      .name('flowFinished')
      .multipleAttribute()
      .schema((builder) =>
        builder
          .attribute('parent', (attr) => attr.optional())
          .attribute('flowId')
          .build()
      )
      .build()
  )
  .defineMessage((builder, ref) =>
    builder
      .name('flowStarted')
      .multipleAttribute()
      .schema((builder) =>
        builder
          .attribute('parent', (attr) => attr.optional())
          .attribute('flowId')
          .build()
      )
      .endsWith(ref('flowFinished'), { blockKey: ['flowId', 'parent'] })
      .build()
  )
  .defineMessage((builder) =>
    builder
      .name('blockClosed')
      .multipleAttribute()
      .schema((builder) => builder.attribute('name').build())
      .build()
  )
  .defineMessage((builder, ref) =>
    builder
      .name('blockOpened')
      .multipleAttribute()
      .schema((builder) =>
        builder
          .attribute('name')
          .attribute('description', (attr) => attr.optional())
          .build()
      )
      .endsWith(ref('blockClosed'), { blockKey: ['name'] })
      .build()
  )
  .defineMessage((builder) =>
    builder
      .name('compilationFinished')
      .multipleAttribute()
      .schema((builder) => builder.attribute('compiler').build())
      .build()
  )
  .defineMessage((builder, ref) =>
    builder
      .name('compilationStarted')
      .multipleAttribute()
      .schema((builder) => builder.attribute('compiler').build())
      .endsWith(ref('compilationFinished'), { blockKey: ['compiler'] })
      .build()
  )
  .defineMessage((builder) =>
    builder
      .name('testSuiteFinished')
      .multipleAttribute()
      .schema(() => baseTestSchema.build())
      .build()
  )

  .defineMessage((builder, ref) =>
    builder
      .name('testSuiteStarted')
      .multipleAttribute()
      .schema(() => baseTestSchema.build())
      .endsWith(ref('testSuiteFinished'), { blockKey: ['name'] })
      .build()
  )
  .defineMessage((builder) =>
    builder
      .name('testFinished')
      .multipleAttribute()
      .schema(() =>
        baseTestSchema
          .attribute('duration', (attr) =>
            z.coerce.number().positive().int().optional()
          )
          .build()
      )
      .build()
  )
  .defineMessage((builder, ref) =>
    builder
      .name('testStarted')
      .multipleAttribute()
      .schema(() =>
        baseTestSchema
          .attribute('captureStandardOutput', (attr) =>
            z.coerce.boolean().default(false)
          )
          .build()
      )
      .endsWith(ref('testFinished'), { blockKey: ['name'] })
      .build()
  )
  .defineMessage((builder) =>
    builder
      .name('testIgnored')
      .multipleAttribute()
      .schema(() =>
        baseTestSchema.attribute('message', (attr) => attr.optional()).build()
      )
      .build()
  )
  .defineMessage((builder) =>
    builder
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
      .build()
  )
  .defineMessage((builder) =>
    builder
      .name('testStdOut')
      .multipleAttribute()
      .schema(() => baseTestSchema.attribute('out').build())
      .build()
  )
  .defineMessage((builder) =>
    builder
      .name('testStdErr')
      .multipleAttribute()
      .schema(() => baseTestSchema.attribute('out').build())
      .build()
  )
  .defineMessage((builder) =>
    builder
      .name('testRetrySupport')
      .multipleAttribute()
      .schema((builder) =>
        builder.attribute('enabled', () => z.coerce.boolean()).build()
      )
      .build()
  )
  .build()
