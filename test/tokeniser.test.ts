import { describe, expect } from 'vitest'

import { test } from './fixtures/wrappers'
import { TokenTypes, TokeniserOpts, tokeniser } from '../src/tokeniser'
import { Token } from 'moo'

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
})
