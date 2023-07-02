import { Readable, Transform, TransformCallback } from 'node:stream'

import {
  MessageTypeRepository,
  defaultMessageTypeRepository,
} from '../messages/repository.js'

export class LinearStreamParser extends Transform {
  private buffer: string = ''
  protected repository: MessageTypeRepository<any>

  constructor(
    repository: MessageTypeRepository<any> = defaultMessageTypeRepository
  ) {
    super({ objectMode: true })
    this.repository = repository
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
      try {
        const message = this.repository.parse(line)
        try {
          message.validate()
        } catch {}

        this.push(message)
      } catch {
        this.push(line)
      }

      boundary = this.buffer.indexOf('\n')
    }

    callback()
  }

  _flush(callback: TransformCallback): void {
    if (this.buffer.length > 0) {
      try {
        const message = this.repository.parse(this.buffer)
        try {
          message.validate()
        } catch {}
        this.push(message)
      } catch {
        this.push(this.buffer)
      }
    }
    callback()
  }
}

// export class TreeStreamParser extends Transform {
//   public currentContext: TcDummySuite | undefined = undefined
//   public tree: TcDummyTestLogger = new TcDummyTestLogger(
//     new Readable({ encoding: 'utf8', read: () => {} })
//   )

//   constructor() {
//     super({ objectMode: true })
//   }

//   _transform(
//     chunk: any,
//     _encoding: BufferEncoding,
//     callback: TransformCallback
//   ): void {
//     if (typeof chunk === 'string') {
//       if (this.currentContext instanceof TcDummySuite) {
//         this.currentContext.appendToStdOut(chunk)
//         this.push(this.tree)
//       }
//     } else {
//       if (chunk instanceof TcTestSuiteStarted) {
//         this.tree.addOrReplaceSuite(chunk.name() as string, (suite) => {
//           suite.name(chunk.name() as string as string) as TcDummySuite
//           this.currentContext = suite
//           return suite
//         })
//         this.push(this.tree)
//       }
//     }

//     callback()
//   }

//   _flush(callback: TransformCallback): void {
//     callback()
//   }
// }
