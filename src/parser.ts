import { Readable, Transform, TransformCallback } from 'node:stream'

import messages, {
  TcTestSuiteStarted,
} from './messages/wrappers/default-messages.js'
import { TcDummySuite, TcDummyTestLogger } from './logger.js'
import { defaultMessageFromLineFactory } from './parser/string-parse.js'

export class LinearStreamParser extends Transform {
  private buffer: string = ''

  constructor() {
    super({ objectMode: true })
  }

  _transform(
    chunk: any,
    _encoding: BufferEncoding,
    callback: TransformCallback
  ): void {
    this.buffer += chunk.toString().replace(/\r\n/g, '\n')
    let boundary = this.buffer.indexOf('\n')

    while (boundary !== -1) {
      const line = this.buffer.substring(0, boundary)
      this.buffer = this.buffer.substr(boundary + 1)
      const processedLogLine = defaultMessageFromLineFactory(line)
      if (processedLogLine) {
        this.push(processedLogLine)
        this.emit(processedLogLine.messageName, processedLogLine)
      } else {
        this.push(line)
      }
      boundary = this.buffer.indexOf('\n')
    }

    callback()
  }

  _flush(callback: TransformCallback): void {
    if (this.buffer.length > 0) {
      const processedLogLine = defaultMessageFromLineFactory(this.buffer)
      if (processedLogLine) {
        this.push(processedLogLine)
      } else {
        this.push(this.buffer)
      }
    }
    callback()
  }
}

export class TreeStreamParser extends Transform {
  public currentContext: TcDummySuite | undefined = undefined
  public tree: TcDummyTestLogger = new TcDummyTestLogger(
    new Readable({ encoding: 'utf8', read: () => {} })
  )

  constructor() {
    super({ objectMode: true })
  }

  _transform(
    chunk: any,
    _encoding: BufferEncoding,
    callback: TransformCallback
  ): void {
    if (typeof chunk === 'string') {
      if (this.currentContext instanceof TcDummySuite) {
        this.currentContext.appendToStdOut(chunk)
        this.push(this.tree)
      }
    } else {
      if (chunk instanceof TcTestSuiteStarted) {
        this.tree.addOrReplaceSuite(chunk.name() as string, (suite) => {
          suite.name(chunk.name() as string as string) as TcDummySuite
          this.currentContext = suite
          return suite
        })
        this.push(this.tree)
      }
    }

    callback()
  }

  _flush(callback: TransformCallback): void {
    callback()
  }
}
