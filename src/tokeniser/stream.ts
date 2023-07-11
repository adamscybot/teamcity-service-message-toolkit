import { Lexer } from 'moo'

import { TransformStream } from 'tc-message-toolkit/stream'
import { Token, TokeniserOpts, tokeniser } from './lexer.js'

class TokeniseTransformer implements Transformer<string, Token> {
  #previous = ''
  tokeniser: Lexer

  constructor(opts?: TokeniserOpts) {
    this.tokeniser = tokeniser(opts)
  }

  transform: TransformerTransformCallback<string, Token> | undefined = (
    chunk,
    controller
  ) => {
    let startSearch = this.#previous.length
    this.#previous += chunk
    while (true) {
      const eolIndex = this.#previous.indexOf('\n', startSearch)
      if (eolIndex < 0) break
      const line = this.#previous.slice(0, eolIndex + 1)
      this.tokeniser.reset(line)
      try {
        for (const token of this.tokeniser) {
          controller.enqueue(token as Token)
        }
      } catch (e) {
        console.error(e)
      }
      this.#previous = this.#previous.slice(eolIndex + 1)
      startSearch = 0
    }
  }

  flush: TransformerFlushCallback<Token> | undefined = (controller) => {
    if (this.#previous.length > 0) {
      this.tokeniser.reset(this.#previous)
      try {
        for (const token of this.tokeniser) {
          controller.enqueue(token as Token)
        }
      } catch (e) {
        console.error(e)
      }
    }
  }
}

export class TokeniserStream extends TransformStream<string, Token> {
  constructor(opts?: TokeniserOpts) {
    super(new TokeniseTransformer(opts))
  }
}

// const tokeniserStream = () => {
//   return new TransformStream({
//     transform(chunk, controller) {
//       controller.enqueue(chunk.toUpperCase());
//     },
//   });
// }
