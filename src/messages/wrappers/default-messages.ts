import {
  TcStringSingleAttributeMessage,
  TcStringMultiAttributeMessage,
} from './base-message-types.js'

/**
 * Used to indicate to the consumer the build number that represents this execution.
 */
export class TcBuildNumberMessage extends TcStringSingleAttributeMessage {
  public static readonly messageName = 'buildNumber'
}

export class TcPublishArtifacts extends TcStringSingleAttributeMessage {
  public static readonly messageName = 'publishArtifacts'
}

export class TcProgressMessage extends TcStringSingleAttributeMessage {
  public static readonly messageName = 'progressMessage'
}

export class TcProgressStartMessage extends TcStringSingleAttributeMessage {
  public static readonly messageName = 'progressStart'
}

export class TcProgressFinishMessage extends TcStringSingleAttributeMessage {
  public static readonly messageName = 'progressFinish'
}

export enum TcMessageStatus {
  NORMAL = 'NORMAL',
  WARNING = 'WARNING',
  FAILURE = 'FAILURE',
  ERROR = 'ERROR',
}

export class TcMessage extends TcStringMultiAttributeMessage<{
  text: { type: string; required: true }
  errorDetails: { type: string; required: false }
  status: { type: TcMessageStatus; required: false }
}> {
  public static readonly messageName = 'message'
}

export abstract class TcFlowMessage extends TcMultiAttributeMessage<'parent'> {
  parentId(parentFlowId: string) {
    this.attr('parent', parentFlowId)
    return this
  }
}

export class TcFlowStarted extends TcFlowMessage {
  public static readonly messageName = 'flowStarted'
}

export class TcFlowFinished extends TcFlowMessage {
  public static readonly messageName = 'flowFinished'
}

export class TcBlockOpened extends TcMultiAttributeMessage<
  'name' | 'description'
> {
  public static readonly messageName = 'blockOpened'

  name(name: string) {
    this.attr('name', name)
    return this
  }

  description(description: string) {
    this.attr('description', description)
    return this
  }
}

export class TcBlockClosed extends TcMultiAttributeMessage<'name'> {
  public static readonly messageName = 'blockClosed'

  name(name: string) {
    this.attr('name', name)
    return this
  }
}

export abstract class TcCompilationMessage extends TcMultiAttributeMessage<'compiler'> {
  compiler(compiler: string) {
    this.attr('compiler', compiler)
    return this
  }
}

export class TcCompilationStarted extends TcCompilationMessage {
  public static readonly messageName = 'compilationStarted'
}

export class TcCompilationFinished extends TcCompilationMessage {
  public static readonly messageName = 'compilationFinished'
}

export abstract class TcTestMessage<
  Keys extends string = ''
> extends TcMultiAttributeMessage<('name' | 'timestamp') | Keys> {
  /**
   * The unique name of this suite or test. This is used to capture the beginning/end of each
   * suite and test and so must not be duplicated in one execution.
   *
   * @param name The unique build number that represents this build
   * @example
   *
   * ```
   * message.name('Test com.mystuff.app')
   * ```
   */
  setName(name: string) {
    this.attr('name', name)
    return this
  }

  getName() {
    return this.attr('name')
  }

  /**
   * Allows a timestamp attribute to be added to this event. Useful if wanting to capture when
   * a certain test event happened.
   *
   * @param timestamp The time as a `Date` object that represents when this event happened.
   * @example
   *
   * ```
   * message.timestamp(Date.now())
   * ```
   */
  timestamp(timestamp: Date) {
    this.attr('timestamp', timestamp.toISOString())
    return this
  }
}

export class TcTestSuiteStarted extends TcTestMessage {
  public static readonly messageName = 'testSuiteStarted'
}

export class TcTestSuiteFinished extends TcTestMessage {
  public static readonly messageName = 'testSuiteFinished'
}

export class TcTestStarted extends TcTestMessage<'captureStandardOutput'> {
  public static readonly messageName = 'testStarted'

  /**
   * Consumers typically should assume that test runs use `testStdOut` and `testStdErr` messages to denote test output.
   * This can be set to true to avoid having to use those messages as if it is true, all output up to `testFinished` is considered
   * part of the test output.
   *
   * @param captureStandardOutput A boolean that if set to true, instructs the consumer to consider stdout up to when the `testFinished` fires as output for this test.
   * @example
   *
   * ```
   * message.captureStandardOutput(true)
   * ```
   */
  captureStandardOutput(captureStandardOutput: boolean) {
    this.attr('captureStandardOutput', String(captureStandardOutput))
    return this
  }
}

export class TcTestFinished extends TcTestMessage<'duration'> {
  public static readonly messageName = 'testFinished'

  duration(duration: number) {
    this.attr('timestamp', String(Math.round(duration)))
    return this
  }
}

export class TcTestIgnored extends TcTestMessage<'message'> {
  public static readonly messageName = 'testIgnored'

  message(message: string) {
    this.attr('message', message)
    return this
  }
}

export type TcTestFailedType = 'comparisonFailure'

export class TcTestFailed extends TcTestMessage<
  'message' | 'details' | 'expected' | 'actual' | 'type'
> {
  public static readonly messageName = 'testFailed'

  message(message: string) {
    this.attr('message', message)
    return this
  }

  details(details: string) {
    this.attr('details', details)
    return this
  }

  expected(expected: string) {
    this.attr('expected', expected)
    return this
  }

  actual(actual: string) {
    this.attr('actual', actual)
    return this
  }

  type(type: TcTestFailedType) {
    this.attr('type', type)
    return this
  }
}

export class TcTestStdOut extends TcTestMessage<'out'> {
  public static readonly messageName = 'testStdOut'

  out(out: string) {
    this.attr('out', out)
    return this
  }
}

export class TcTestStdErr extends TcTestMessage<'out'> {
  public static readonly messageName = 'testStdErr'

  out(out: string) {
    this.attr('out', out)
    return this
  }
}

export class TcTestRetrySupport extends TcMultiAttributeMessage<'enabled'> {
  public static readonly messageName = 'testRetrySupport'

  enabled(enabled: boolean) {
    this.attr('enabled', String(enabled))
    return this
  }
}

export const singleAttributeMessages = [
  TcBuildNumberMessage,
  TcPublishArtifacts,
  TcProgressMessage,
  TcProgressStartMessage,
  TcProgressFinishMessage,
] as const

export const multiAttributeMessages = [
  TcMessage,
  TcFlowStarted,
  TcFlowFinished,
  TcBlockOpened,
  TcBlockClosed,
  TcCompilationStarted,
  TcCompilationFinished,
  TcTestSuiteStarted,
  TcTestSuiteFinished,
  TcTestStarted,
  TcTestFinished,
  TcTestIgnored,
  TcTestFailed,
  TcTestStdOut,
  TcTestStdErr,
  TcTestRetrySupport,
] as const

const messages = [...singleAttributeMessages, ...multiAttributeMessages]
export default messages

export type MultiAttributeMessages = (typeof multiAttributeMessages)[number]
export type SingleAttributeMessages = (typeof singleAttributeMessages)[number]
export type Messages = (typeof messages)[number]
