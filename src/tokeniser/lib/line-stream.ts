import { Transformer, TransformStream } from 'node:stream/web'
import {
  TransformerFlushCallback,
  TransformerTransformCallback,
} from 'stream/web'

class ChunksToLinesTransformer implements Transformer<string, string> {
  #previous = ''

  transform: TransformerTransformCallback<string, string> | undefined = (
    chunk,
    controller
  ) => {
    let startSearch = this.#previous.length
    this.#previous += chunk
    while (true) {
      const eolIndex = this.#previous.indexOf('\n', startSearch)
      if (eolIndex < 0) break
      // Retain the EOL
      const line = this.#previous.slice(0, eolIndex + 1)
      controller.enqueue(line)
      this.#previous = this.#previous.slice(eolIndex + 1)
      startSearch = 0
    }
  }

  flush: TransformerFlushCallback<string> | undefined = (controller) => {
    if (this.#previous.length > 0) {
      controller.enqueue(this.#previous)
    }
  }
}

export class ChunksToLinesStream extends TransformStream {
  constructor() {
    super(new ChunksToLinesTransformer())
  }
}
