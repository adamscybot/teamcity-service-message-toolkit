import {
  MultiAttributeMessage,
  SingleAttributeMessage,
} from '../../messages/types'
import { BasicMessageStreamOutputChunk } from './basic'
import { SemanticMessageStreamChunk } from './semantic'

export class AnsiLoggerTransformer
  implements
    Transformer<SemanticMessageStreamChunk, SemanticMessageStreamChunk>
{
  transform(
    chunk: SemanticMessageStreamChunk,
    controller: TransformStreamDefaultController<SemanticMessageStreamChunk>
  ) {
    if ((chunk as BasicMessageStreamOutputChunk).type === 'output') {
      process.stdout.write((chunk as BasicMessageStreamOutputChunk).payload)
      controller.enqueue(chunk)
      return
    }

    if (
      (
        chunk as
          | SingleAttributeMessage<any, any, any>
          | MultiAttributeMessage<any, any, any, any>
      ).messageName
    ) {
      process.stdout.write(
        (
          chunk as
            | SingleAttributeMessage<any, any, any>
            | MultiAttributeMessage<any, any, any, any>
        ).ansi()
      )
      controller.enqueue(chunk)
    }
  }

  flush() {}
}

export class AnsiLoggerStream extends TransformStream<SemanticMessageStreamChunk> {
  constructor() {
    super(new AnsiLoggerTransformer())
  }
}
