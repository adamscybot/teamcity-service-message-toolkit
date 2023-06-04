import { z } from 'zod'
import messageTypeBuilder, {
  MultipleAttributeMessageFactory,
  SingleAttributeMessageFactory,
} from './builder.js'
import schemaBuilder from './schema.js'
import { TC_STATISTICS_KEYS, TC_XML_TYPES } from './constants.js'

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
export const defaultTypeRepository = messageTypeRepository([
  messageTypeBuilder.name('buildNumber').singleAttribute().build(),
  messageTypeBuilder.name('publishArtifacts').singleAttribute().build(),
  messageTypeBuilder.name('progressMessage').singleAttribute().build(),
  messageTypeBuilder.name('progressStart').singleAttribute().build(),
  messageTypeBuilder.name('progressFinish').singleAttribute().build(),
  messageTypeBuilder.name('addBuildTag').singleAttribute().build(),
  messageTypeBuilder.name('removeBuildTag').singleAttribute().build(),

  // TODO: Deal with these non-value non-attribute messages
  messageTypeBuilder.name('enableServiceMessages').singleAttribute().build(),
  messageTypeBuilder.name('disableServiceMessages').singleAttribute().build(),

  messageTypeBuilder
    .name('buildProblem')
    .multipleAttribute()
    .schema((schema) =>
      schema
        .attribute('description')
        .attribute('identity', (attr) => attr.max(60).optional())
        .build()
    )
    .build(),
  messageTypeBuilder
    .name('buildStatus')
    .multipleAttribute()
    .schema((schema) =>
      schema
        .attribute('text')
        .attribute('status', (attr) => attr.optional())
        .build()
    )
    .build(),
  messageTypeBuilder
    .name('setParameter')
    .multipleAttribute()
    .schema((schema) => schema.attribute('name').attribute('value').build())
    .build(),
  messageTypeBuilder
    .name('buildStatisticValue')
    .multipleAttribute()
    .schema((schema) =>
      schema
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
    .schema((schema) => {
      const baseImportDataSchema = schema
        .attribute('path')
        .attribute('verbose', () => z.coerce.boolean().default(false))
        .attribute('parseOutOfDate', () => z.coerce.boolean().default(false))
        .attribute('whenNoDataPublished', () =>
          z.enum(['info', 'nothing', 'warning', 'error']).default('info')
        )

      const importTypes = z.enum(TC_XML_TYPES)
      return z.discriminatedUnion('type', [
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
    .schema((schema) =>
      z.discriminatedUnion('notifier', [
        schema
          .attribute('notifier', () => z.literal('slack'))
          .attribute('message')
          .attribute('sendTo')
          .attribute('connectionID', (attr) => attr.optional())
          .build(),
        schema
          .attribute('notifier', () => z.literal('email'))
          .attribute('message')
          .attribute('subject')
          .attribute('address', (attr) =>
            attr
              .transform((val) => val.split(','))
              .pipe(z.array(z.string()).nonempty())
          )
          .build(),
      ])
    )
    .build(),
  messageTypeBuilder
    .name('buildStop')
    .multipleAttribute()
    .schema((schema) =>
      schema
        .attribute('comment')
        .attribute('readdToQueue', () => z.coerce.boolean())
        .build()
    )
    .build(),
  messageTypeBuilder
    .name('inspectionType')
    .multipleAttribute()
    .schema((schema) =>
      schema
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
    .schema((schema) =>
      schema
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
    .schema((schema) =>
      schema
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
    .schema((schema) =>
      schema.attribute('parent', (attr) => attr.optional()).build()
    )
    .build(),
  messageTypeBuilder
    .name('flowFinished')
    .multipleAttribute()
    .schema((schema) =>
      schema.attribute('parent', (attr) => attr.optional()).build()
    )
    .build(),
  messageTypeBuilder
    .name('blockOpened')
    .multipleAttribute()
    .schema((schema) =>
      schema
        .attribute('name')
        .attribute('description', (attr) => attr.optional())
        .build()
    )
    .build(),
  messageTypeBuilder
    .name('blockClosed')
    .multipleAttribute()
    .schema((schema) => schema.attribute('name').build())
    .build(),
  messageTypeBuilder
    .name('compilationStarted')
    .multipleAttribute()
    .schema((schema) => schema.attribute('compiler').build())
    .build(),
  messageTypeBuilder
    .name('compilationFinished')
    .multipleAttribute()
    .schema((schema) => schema.attribute('compiler').build())
    .build(),
  messageTypeBuilder
    .name('testSuiteStarted')
    .multipleAttribute()
    .schema(() => baseTestSchema.build())
    .build(),
  messageTypeBuilder
    .name('testSuiteFinished')
    .multipleAttribute()
    .schema(() => baseTestSchema.build())
    .build(),
  messageTypeBuilder
    .name('testStarted')
    .multipleAttribute()
    .schema((schema) =>
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
    .schema((schema) =>
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
    .schema((schema) =>
      baseTestSchema.attribute('message', (attr) => attr.optional()).build()
    )
    .build(),
  messageTypeBuilder
    .name('testFailed')
    .multipleAttribute()
    .schema((schema) => {
      const baseTestFailedSchema = baseTestSchema
        .attribute('message')
        .attribute('details', (attr) => attr.optional())

      return z.discriminatedUnion('type', [
        baseTestFailedSchema
          .attribute('type', () => z.literal('comparisonFailure'))
          .attribute('expected', (attr) => attr.optional())
          .attribute('actual', (attr) => attr.optional())
          .build(),

        baseTestFailedSchema.attribute('type').build(),
      ])
    })
    .build(),
  messageTypeBuilder
    .name('testStdOut')
    .multipleAttribute()
    .schema((schema) => baseTestSchema.attribute('out').build())
    .build(),
  messageTypeBuilder
    .name('testStdErr')
    .multipleAttribute()
    .schema((schema) => baseTestSchema.attribute('out').build())
    .build(),
  messageTypeBuilder
    .name('testRetrySupport')
    .multipleAttribute()
    .schema((schema) =>
      schema.attribute('enabled', () => z.coerce.boolean()).build()
    )
    .build(),
])
