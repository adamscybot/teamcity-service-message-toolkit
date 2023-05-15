// @ts-nocheck
/**
 * Provides an API that allows you to configure a stream that simulates a test runner that outputs TeamCity
 * formatted log lines.
 */

import parseDuration from 'parse-duration'
import { Readable } from 'node:stream'
import { buildServiceMessage } from './parser/string-parse.js'

export type BeforeSuiteAddedCallback = (
  suite: TcDummySuite,
  index: number
) => void
export type BeforeTestAddedCallback = (
  suite: TcDummyTestIgnored | TcDummyTestSucceeds | TcDummyTestFails,
  index: number
) => void

abstract class TcStreamable {
  protected readableStream: Readable

  constructor(stream: Readable) {
    this.readableStream = stream
  }

  protected pushTcEvent(...args: Parameters<typeof buildServiceMessage>) {
    this.readableStream.push('\n' + buildServiceMessage(...args))
  }

  /**
   * Get access to the underlying `ReadableStream`. This can be used to listen to events
   * or manipulate the stream.
   *
   * @param cb A callback which is passed the underlying `ReadableStream`
   *
   * @example
   * ```
   * logger.addSuite((suite) => suite.name('Example suite')).stream((stream) => stream.)
   * ```
   */
  stream(cb: (stream: Readable) => void) {
    cb(this.readableStream)
    return this
  }

  abstract exec(): Promise<void>
}

abstract class TcContainsRawText extends TcStreamable {
  protected _stdOut: string = ''
  protected _stdErr: string = ''

  appendToStdOut(text: string) {
    this._stdOut += text
  }

  appendToStdErr(text: string) {
    this._stdErr += text
  }
}

export class TcDelay extends TcStreamable {
  private duration: string

  constructor(stream: Readable, duration: string) {
    super(stream)
    this.duration = duration
  }

  exec() {
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        resolve()
      }, parseDuration(this.duration))
    })
  }
}

export abstract class TcBaseTest extends TcStreamable {
  protected nameString: string = 'Fake Test'

  name(name: string) {
    this.nameString = name
    return this
  }

  protected async pushTest(
    cb: () => void,
    opts?: { duration?: string; realTime?: boolean }
  ) {
    const { duration, realTime = false } = opts ?? {}
    this.pushTcEvent({
      messageName: 'testStarted',
      kwargs: {
        name: this.nameString,
      },
    })

    const durationMs = duration !== undefined ? parseDuration(duration) : null

    if (duration !== undefined && realTime) {
      const delayTask = new TcDelay(this.readableStream, duration)
      await delayTask.exec()
    }
    cb()

    this.pushTcEvent({
      messageName: 'testFinished',
      kwargs: {
        name: this.nameString,
        ...(typeof durationMs === 'number'
          ? { duration: `${durationMs}` }
          : {}),
      },
    })
  }
}

export abstract class TcDummyTestRunnable extends TcBaseTest {
  protected durationString: string | undefined = undefined
  protected realTime: boolean | undefined = undefined
  protected bodyContent: string | null = null

  duration(duration: string, opts?: { realTime?: boolean }) {
    this.durationString = duration
    this.realTime = opts?.realTime
    return this
  }

  body(content: string) {
    this.bodyContent = content
    return this
  }

  protected async pushRunnableTest(cb?: () => void) {
    await this.pushTest(
      () => {
        if (this.bodyContent !== null)
          this.readableStream.push(`\n${this.bodyContent}`)
        cb?.()
      },
      { duration: this.durationString, realTime: this.realTime }
    )
  }
}

export class TcDummyTestIgnored extends TcBaseTest {
  protected messageString: string = 'ignored'
  protected wrapped: boolean = false

  /**
   * Set the failure message.
   *
   * @param message The string containing the high level failure message
   */
  message(message: string) {
    this.messageString = message
    return this
  }

  /**
   * TC allows log output for ignored tests to be bookended by start/finish markers or to be standalone.
   * Setting this to true adds the bookending. Useful for testing different parsing scenarios.
   **/
  wrap(shouldWrap: boolean = true) {
    this.wrapped = shouldWrap
    return this
  }

  async exec() {
    const execIgnore = () =>
      this.pushTcEvent({
        messageName: 'testIgnored',
        kwargs: {
          name: this.nameString,
        },
      })

    if (this.wrapped) {
      await this.pushTest(() => execIgnore())
    } else {
      execIgnore()
    }
  }
}

export class TcDummyTestSucceeds extends TcDummyTestRunnable {
  async exec() {
    await this.pushRunnableTest()
  }
}

export class TcDummyTestFails extends TcDummyTestRunnable {
  private messageString: string | null = null
  private detailsString: string | null = null

  /**
   * Set the failure message.
   *
   * @param message The string containing the high level failure message
   */
  message(message: string) {
    this.messageString = message
    return this
  }

  /**
   * Set the details message, usually used for stack traces relating to the error.
   *
   * @param message The string containing the additional error details
   */
  details(details: string) {
    this.detailsString = details
    return this
  }

  async exec() {
    await this.pushRunnableTest(() => {
      this.pushTcEvent({
        messageName: 'testFailed',
        kwargs: {
          ...(this.messageString !== null
            ? { message: this.messageString }
            : {}),
          ...(this.detailsString !== null
            ? { details: this.detailsString }
            : {}),
        },
      })
    })
  }
}

export class TcDummyTestAccessor {
  protected stream: Readable

  constructor(stream: Readable) {
    this.stream = stream
  }

  /**
   * Define the test as one which will been ignored.
   *
   * @returns a test configuration object for further customisation.
   */
  ignored() {
    return new TcDummyTestIgnored(this.stream)
  }

  /**
   * Define the test as one which will succeed.
   *
   * @returns a test configuration object for further customisation.
   */
  succeeds() {
    return new TcDummyTestSucceeds(this.stream)
  }

  /**
   * Define the test as one which will fail.
   *
   * @returns a test configuration object for further customisation.
   */
  fails() {
    return new TcDummyTestFails(this.stream)
  }
}

export class TcDummySuite extends TcContainsRawText {
  private beforeTestAddedCb: BeforeTestAddedCallback | undefined = undefined
  private testCounter: number = 1
  private nameString: string = ''
  private tasks: (
    | TcDummyTestIgnored
    | TcDummyTestSucceeds
    | TcDummyTestFails
    | TcDelay
  )[] = []

  constructor(
    stream: Readable,
    opts?: { beforeTestAdded?: BeforeTestAddedCallback }
  ) {
    super(stream)
    this.beforeTestAddedCb = opts?.beforeTestAdded
  }

  /**
   * Set the name of this suite.
   *
   * @param name The new name of the suite which will be shown in the log output
   *
   * @example
   * ```
   * logger.addSuite((suite) => suite.name('Example suite'))
   * ```
   */
  name(name?: string) {
    if (!name) return this.nameString
    this.nameString = name
    return this
  }

  /**
   * Add a an individual test to this suite and allow it to be configured.
   *
   * @param cb A callback that is passed the new test for further configuration
   *
   * @example
   * ```
   * logger.addSuite((suite) => suite.name('Example suite')
   *   .addTest(test => test.success().name('Example Test')))
   * ```
   */
  addTest(
    cb: (
      suite: TcDummyTestAccessor
    ) => TcDummyTestIgnored | TcDummyTestSucceeds | TcDummyTestFails
  ) {
    const newTest = cb(new TcDummyTestAccessor(this.readableStream))

    if (this.beforeTestAddedCb) {
      this.beforeTestAddedCb(newTest, this.testCounter)
    }

    this.tasks.push(newTest)
    this.testCounter++
    return this
  }

  /**
   * Add a delay between the output of each test
   *
   * @param duration A duration in string form compatible with the `parse-duration` duration library. E.g. 10s
   *
   * @example
   *
   * ```
   * logger.addSuite((suite) => suite.name('Example suite')
   *   .addTest(test => test.success().name('Example Test'))
   *   .delay('10s')
   *   .addTest(test => test.success().name('Delayed Test')))
   * ```
   */
  delay(duration: string) {
    this.tasks.push(new TcDelay(this.readableStream, duration))
    return this
  }

  async exec() {
    this.pushTcEvent({
      messageName: 'testSuiteStarted',
      kwargs: { name: this.nameString },
    })

    for (let task of this.tasks) {
      await task.exec()
    }

    this.pushTcEvent({
      messageName: 'testSuiteFinished',
      kwargs: { name: this.nameString },
    })
  }
}

export class TcDummyTestLogger extends TcStreamable {
  private suites: TcDummySuite[] = []
  private suiteCounter: number = 1
  private beforeSuiteAddedCb: BeforeSuiteAddedCallback | undefined = undefined
  private beforeTestAddedCb: BeforeTestAddedCallback | undefined = undefined

  /**
   * Add a test suite and allow it to be configured.
   *
   * @param cb A callback that is passed the new suite for further configuration
   *
   * @example
   *
   * ```
   * logger.addSuite((suite) => suite.name('Example suite'))
   * ```
   */
  addSuite(cb: (suite: TcDummySuite) => TcDummySuite) {
    const newSuite = cb(
      new TcDummySuite(this.readableStream, {
        beforeTestAdded: this.beforeTestAddedCb,
      })
    )

    if (this.beforeSuiteAddedCb) {
      this.beforeSuiteAddedCb(newSuite, this.suiteCounter)
    }

    this.suites.push(newSuite)
    this.suiteCounter++
    return this
  }

  addOrReplaceSuite(name: string, cb: (suite: TcDummySuite) => TcDummySuite) {
    const existingSuite = this.suites.find((suite) => suite.name() === name)

    const newSuite = cb(
      existingSuite ??
        new TcDummySuite(this.readableStream, {
          beforeTestAdded: this.beforeTestAddedCb,
        })
    )

    if (this.beforeSuiteAddedCb) {
      this.beforeSuiteAddedCb(newSuite, this.suiteCounter)
    }

    this.suites.push(newSuite)
    this.suiteCounter++
    return this
  }

  beforeSuiteAdded(cb: BeforeSuiteAddedCallback) {
    this.beforeSuiteAddedCb = cb
    return this
  }

  beforeTestAdded(cb: BeforeTestAddedCallback) {
    this.beforeTestAddedCb = cb
    return this
  }
  /**
   * Start outputting the configured logging to the stream.
   *
   * @returns {Promise} a promise that resolves once all of the requested log output is outputted to the stream.
   */
  async exec() {
    for (const suite of this.suites) {
      await suite.exec()
    }
    this.readableStream.push(null)
  }

  /**
   * Configure the stream to pipe into another stream. This is provided as a utility wrapper around
   * `logger.stream(stream => stream.pipe()`
   *
   * @example
   * Output all the logs to stdout
   *
   * ```
   * logger.pipe(process.stdout)
   * ```
   **/
  pipe(...args: Parameters<typeof this.readableStream.pipe>) {
    this.readableStream.pipe(...args)
    return this
  }

  processMessage() {}
}

export default () =>
  new TcDummyTestLogger(new Readable({ encoding: 'utf8', read: () => {} }))
