import { describe, expect } from 'vitest'
import { ReadableStream } from 'node:stream/web'

import { test } from './fixtures/wrappers'
import { default as t, TokeniserOpts, tokeniser } from '../src/tokeniser'
import { getAsyncIterableFor } from '../src/lib/async-iterable'

const getAllTokens = (line: string, opts?: TokeniserOpts) => {
  const lexer = tokeniser(opts)
  lexer.reset(line)
  return Array.from(lexer)
}

describe('Tokeniser', () => {
  describe('Lexer foundation', () => {
    test('Tokenises single attribute message', () => {
      expect(
        getAllTokens("##teamcity[testMessage attributeExample='hello']")
      ).toMatchSnapshot()
    })

    test('Escapes string literals', () => {
      expect(
        getAllTokens(
          "##teamcity[testMessage attributeExample='|[Diff|cult|r|nmes|'sage |0x0134|]']"
        )
      ).toMatchSnapshot()
    })
  })

  describe('Stream', () => {
    test('Tokenises single attribute message', async () => {
      const myString = `##teamcity[aaaaa 'fdg' ]
##teamcity[bbbbbb '|[Diff|cult|r|nmes|'sage |0x0134|]' ]
##teamcity[asdasd s= ] dsadsa
asd
`

      const readable = new ReadableStream({
        start(controller) {
          const chunks = myString.split('\n').map((line) => line + '\n')
          chunks.forEach((chunk) => {
            controller.enqueue(chunk)
          })
          controller.close()
        },
      })

      const transformed = readable.pipeThrough(t.stream())

      // ;(async function () {
      //   for await (const line of getAsyncIterableFor(transformed)) {
      //     console.log('hello', line)
      //   }
      // })()
    })
  })
})
