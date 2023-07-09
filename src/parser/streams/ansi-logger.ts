import {
  MultiAttributeMessage,
  SingleAttributeMessage,
} from '../../messages/types'
import { SemanticMessageStreamChunk } from './semantic'

export class AnsiLoggerTransformer
  implements
    Transformer<SemanticMessageStreamChunk, SemanticMessageStreamChunk>
{
  transform(chunk: SemanticMessageStreamChunk, controller) {
    if (chunk.messageName) {
      process.stdout.write(chunk.ansi())
    }

    if (chunk.type === 'output') {
      process.stdout.write(chunk.payload)
    }
    controller.enqueue(chunk)
  }

  flush(controller) {}
}

export class AnsiLoggerStream extends TransformStream<
  SingleAttributeMessage<any, any> | MultiAttributeMessage<any, any>,
  SingleAttributeMessage<any, any> | MultiAttributeMessage<any, any>
> {
  constructor() {
    super(new AnsiLoggerTransformer())
  }
}
