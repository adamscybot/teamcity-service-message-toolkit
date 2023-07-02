import { describe, expect } from 'vitest'
import { z } from 'zod'

import { test } from './fixtures/wrappers'
import {
  TEST_MULTI_ATTR_MESSAGE_NAME,
  TEST_SINGLE_ATTR_MESSAGE_NAME,
} from './fixtures/messages'

describe('Message Builder', () => {
  describe('Single Attribute Messages', () => {
    test('Messages have static property defining their message type', ({
      singleAttrMessageBuilder,
    }) => {
      expect(singleAttrMessageBuilder.build().messageName).toBe(
        TEST_SINGLE_ATTR_MESSAGE_NAME
      )
    })

    test('Messages have message type property', ({
      singleAttrMessageBuilder,
    }) => {
      const message = singleAttrMessageBuilder.build()({})
      expect(message.messageName()).toBe(TEST_SINGLE_ATTR_MESSAGE_NAME)
    })

    test('Messages have flowId property', ({ singleAttrMessageBuilder }) => {
      const message = singleAttrMessageBuilder.build()({ flowId: '1234' })
      expect(message.flowId()).toBe('1234')
    })

    test('Messages expose raw value', ({ singleAttrMessageBuilder }) => {
      const message = singleAttrMessageBuilder.build()({ rawValue: 'test123' })
      expect(message.getRawValue()).toBe('test123')
    })

    test('Messages expose value as string by default', ({
      singleAttrMessageBuilder,
    }) => {
      const message = singleAttrMessageBuilder.build()({ rawValue: 'test123' })
      expect(message.getValue()).toBe('test123')
    })

    test('Messages dont allow value to be undefined by default', ({
      singleAttrMessageBuilder,
    }) => {
      const message = singleAttrMessageBuilder.build()({})
      expect(() => message.getValue()).toThrowErrorMatchingInlineSnapshot(`
        "[
          {
            \\"code\\": \\"invalid_type\\",
            \\"expected\\": \\"string\\",
            \\"received\\": \\"undefined\\",
            \\"path\\": [],
            \\"message\\": \\"Required\\"
          }
        ]"
      `)
    })

    test('Message throws error when it violates schema', ({
      singleAttrMessageBuilder,
    }) => {
      const message = singleAttrMessageBuilder
        .schema(() => z.coerce.number())
        .build()({ rawValue: 'i am not a number' })

      const snapshot = `
        "[
          {
            \\"code\\": \\"invalid_type\\",
            \\"expected\\": \\"number\\",
            \\"received\\": \\"nan\\",
            \\"path\\": [],
            \\"message\\": \\"Expected number, received nan\\"
          }
        ]"
      `
      expect(() => message.validate()).toThrowErrorMatchingSnapshot(snapshot)
      expect(() => message.getValue()).toThrowErrorMatchingSnapshot(snapshot)
    })

    test('Message transforms value in respect to schema', ({
      singleAttrMessageBuilder,
    }) => {
      const message = singleAttrMessageBuilder
        .schema(() => z.coerce.number())
        .build()({ rawValue: '999' })

      expect(() => message.validate()).not.toThrowError()
      expect(message.getValue()).toBe(999)
    })

    test('Messages with value can output as a TC service message string', ({
      singleAttrMessageBuilder,
    }) => {
      const message = singleAttrMessageBuilder.build()({
        rawValue: 'exampleAttr',
      })
      expect(message.toServiceMessageString()).toMatchInlineSnapshot(
        '"##teamcity[testSingleAttrMessage \'exampleAttr\']"'
      )
    })

    test('Messages without value can output as a TC service message string', ({
      singleAttrMessageBuilder,
    }) => {
      const messageWithValue = singleAttrMessageBuilder
        .schema((v) => v.default().optional())
        .build()({})
      expect(messageWithValue.toServiceMessageString()).toMatchInlineSnapshot(
        '"##teamcity[testSingleAttrMessage]"'
      )
    })

    test('Messages TC service string is correctly escaped', ({
      singleAttrMessageBuilder,
    }) => {
      const message = singleAttrMessageBuilder.build()({
        rawValue: "[Diff|cult\r\nmes'sage \u0134]",
      })
      expect(message.toServiceMessageString()).toMatchInlineSnapshot(
        "\"##teamcity[testSingleAttrMessage '|[Diff||cult|r|nmes|'sage |0x0134|]']\""
      )
    })

    test('Messages with flow ID gets flow id in service message string', ({
      singleAttrMessageBuilder,
    }) => {
      const message = singleAttrMessageBuilder.build()({
        rawValue: 'hello',
        flowId: '123',
      })
      expect(message.toServiceMessageString()).toMatchInlineSnapshot(
        "\"##teamcity[testSingleAttrMessage flowId='123' 'hello']\""
      )
    })
  })

  describe('Multi Attribute Messages', () => {
    test('Messages have static property defining their message type', ({
      multiAttrMessageBuilderWithAttrs,
    }) => {
      const factory = multiAttrMessageBuilderWithAttrs.build()
      expect(factory.messageName).toBe(TEST_MULTI_ATTR_MESSAGE_NAME)
    })

    test('Messages have message type property', ({
      multiAttrMessageBuilderWithAttrs,
    }) => {
      const message = multiAttrMessageBuilderWithAttrs.build()({
        rawKwargs: {},
      })
      expect(message.messageName()).toBe(TEST_MULTI_ATTR_MESSAGE_NAME)
    })

    test('Messages have flowId property', ({
      multiAttrMessageBuilderWithAttrs,
    }) => {
      const message = multiAttrMessageBuilderWithAttrs.build()({
        flowId: '1234',
        rawKwargs: { attr1: 'test', attr2: 'test', attr3: 'test' },
      })
      expect(message.flowId()).toBe('1234')
    })

    test('Messages expose raw attrs', ({
      multiAttrMessageBuilderWithAttrs,
    }) => {
      const attrs = { attr1: 'test1', attr2: 'test2', attr3: 'test3' } as const
      const message = multiAttrMessageBuilderWithAttrs.build()({
        rawKwargs: attrs,
      })
      expect(message.getRawAttr('attr1')).toBe('test1')
      expect(message.getRawAttr('attr2')).toBe('test2')
      expect(message.getRawAttr('attr3')).toBe('test3')
      expect(message.getRawAttrs()).toBe(attrs)
    })

    test('Messages expose attrs as string by default', ({
      multiAttrMessageBuilder,
    }) => {
      const attrs = { attr: 'stringExample' } as const
      const message = multiAttrMessageBuilder
        .schema((schema) => schema.attribute('attr').build())
        .build()({
        rawKwargs: attrs,
      })

      expect(message.getAttr('attr')).toBe('stringExample')
      expect(message.getAttrs()).toMatchInlineSnapshot(`
        {
          "attr": "stringExample",
        }
      `)
    })

    test('Messages dont allow value to be undefined by default', ({
      multiAttrMessageBuilder,
    }) => {
      const message = multiAttrMessageBuilder
        .schema((schema) => schema.attribute('attr').build())
        .build()({
        rawKwargs: {},
      })

      const snapshot = `
      "[
        {
          \\"code\\": \\"invalid_type\\",
          \\"expected\\": \\"string\\",
          \\"received\\": \\"undefined\\",
          \\"path\\": [
            \\"attr\\"
          ],
          \\"message\\": \\"Required\\"
        }
      ]"
    `

      expect(() => message.getAttr('attr')).toThrowErrorMatchingSnapshot(
        snapshot
      )
      expect(() => message.getAttrs()).toThrowErrorMatchingSnapshot(snapshot)
    })

    test('Message throws error when it violates schema', ({
      multiAttrMessageBuilder,
    }) => {
      const message = multiAttrMessageBuilder
        .schema((schema) =>
          schema.attribute('example', () => z.coerce.number()).build()
        )
        .build()({ rawKwargs: { example: 'i am not a number' } })

      const snapshot = `
      "[
        {
          \\"code\\": \\"invalid_type\\",
          \\"expected\\": \\"number\\",
          \\"received\\": \\"nan\\",
          \\"path\\": [
            \\"example\\"
          ],
          \\"message\\": \\"Expected number, received nan\\"
        }
      ]"
    `

      expect(() => message.validate()).toThrowErrorMatchingSnapshot(snapshot)
      expect(() => message.getAttr('example')).toThrowErrorMatchingSnapshot(
        snapshot
      )
      expect(() => message.getAttrs()).toThrowErrorMatchingSnapshot(snapshot)
    })

    test('Message transforms value in respect to schema', ({
      multiAttrMessageBuilder,
    }) => {
      const message = multiAttrMessageBuilder
        .schema((schema) =>
          schema.attribute('example', () => z.coerce.number()).build()
        )
        .build()({ rawKwargs: { example: '123' } })

      expect(() => message.validate()).not.toThrowError()
      expect(message.getAttr('example')).toBe(123)
    })

    test('Message is allowed to have extraneous properties as a raw value', ({
      multiAttrMessageBuilder,
    }) => {
      const message = multiAttrMessageBuilder
        .schema((schema) => schema.attribute('example').build())
        .build()({ rawKwargs: { example: '123', extraProperty: '123' } })

      expect(() => message.validate()).not.toThrowError()
      expect(message.getRawAttr('example')).toBe('123')
    })

    test('Messages can output as a TC service message string', ({
      multiAttrMessageBuilderWithAttrs,
    }) => {
      const message = multiAttrMessageBuilderWithAttrs.build()({
        rawKwargs: { attr1: 'test1', attr2: 'test2', attr3: 'test3' },
      })
      expect(message.toServiceMessageString()).toMatchInlineSnapshot(
        "\"##teamcity[testMultiAttrMessage attr1='test1' attr2='test2' attr3='test3']\""
      )
    })

    test('Messages TC service string is correctly escaped', ({
      multiAttrMessageBuilder,
    }) => {
      const message = multiAttrMessageBuilder
        .schema((schema) => schema.attribute('example').build())
        .build()({ rawKwargs: { example: "[Diff|cult\r\nmes'sage \u0134]" } })

      expect(message.toServiceMessageString()).toMatchInlineSnapshot(
        "\"##teamcity[testMultiAttrMessage example='|[Diff||cult|r|nmes|'sage |0x0134|]']\""
      )
    })

    test('Messages with flow ID gets flow id in service message string', ({
      multiAttrMessageBuilder,
    }) => {
      const message = multiAttrMessageBuilder
        .schema((schema) => schema.attribute('example').build())
        .build()({ rawKwargs: { example: 'test' }, flowId: '12345' })
      expect(message.toServiceMessageString()).toMatchInlineSnapshot(
        "\"##teamcity[testMultiAttrMessage flowId='12345' example='test']\""
      )
    })
  })
})
