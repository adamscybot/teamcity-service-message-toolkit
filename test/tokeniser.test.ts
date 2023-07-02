import { describe, expect } from 'vitest'

import { test } from './fixtures/wrappers'
import { TokeniserOpts, tokeniser } from '../src/tokeniser'
import { Token } from 'moo'

const getAllTokens = (line: string, opts?: TokeniserOpts) => {
  const lexer = tokeniser(opts)
  lexer.reset(line)
  const tokens: Token[] = []
  let token: Token | undefined
  while ((token = lexer.next())) {
    tokens.push(token)
  }

  return tokens
}

const expectSingleAttrTokenStructure = (tokens: Token[]) => {}

describe('Tokeniser', () => {
  describe('Lexer foundation', () => {
    test('Tokenises single attribute message', () => {
      expect(
        getAllTokens("##teamcity[testMessage attributeExample='hello']")
      ).toMatchInlineSnapshot(`
        [
          {
            "col": 1,
            "line": 1,
            "lineBreaks": 0,
            "offset": 0,
            "text": "##teamcity",
            "toString": [Function],
            "type": "serviceMessageIdent",
            "value": "##teamcity",
          },
          {
            "col": 11,
            "line": 1,
            "lineBreaks": 0,
            "offset": 10,
            "text": "[",
            "toString": [Function],
            "type": "paramatersOpen",
            "value": "[",
          },
          {
            "col": 12,
            "line": 1,
            "lineBreaks": 0,
            "offset": 11,
            "text": "testMessage",
            "toString": [Function],
            "type": "messageName",
            "value": "testMessage",
          },
          {
            "col": 23,
            "line": 1,
            "lineBreaks": 0,
            "offset": 22,
            "text": " ",
            "toString": [Function],
            "type": "space",
            "value": " ",
          },
          {
            "col": 24,
            "line": 1,
            "lineBreaks": 0,
            "offset": 23,
            "text": "attributeExample",
            "toString": [Function],
            "type": "propertyName",
            "value": "attributeExample",
          },
          {
            "col": 40,
            "line": 1,
            "lineBreaks": 0,
            "offset": 39,
            "text": "=",
            "toString": [Function],
            "type": "propertyAssignOperator",
            "value": "=",
          },
          {
            "col": 41,
            "line": 1,
            "lineBreaks": 0,
            "offset": 40,
            "text": "'",
            "toString": [Function],
            "type": "stringStart",
            "value": "'",
          },
          {
            "col": 42,
            "line": 1,
            "lineBreaks": 0,
            "offset": 41,
            "text": "hello",
            "toString": [Function],
            "type": "stringValue",
            "value": "hello",
          },
          {
            "col": 47,
            "line": 1,
            "lineBreaks": 0,
            "offset": 46,
            "text": "'",
            "toString": [Function],
            "type": "stringEnd",
            "value": "'",
          },
          {
            "col": 48,
            "line": 1,
            "lineBreaks": 0,
            "offset": 47,
            "text": "]",
            "toString": [Function],
            "type": "paramatersClose",
            "value": "]",
          },
        ]
      `)
    })
  })
})
