import { Lexer } from 'moo'
import { Transformer, TransformStream } from 'node:stream/web'

import { Token, TokeniserOpts, tokeniser } from './lexer.js'
import { TransformerTransformCallback } from 'stream/web'

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
        for (let token of this.tokeniser) {
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
        for (let token of this.tokeniser) {
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
