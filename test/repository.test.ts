import { describe, expect } from 'vitest'

import { MissingMessageTypeInRepository } from '../src/lib/errors.js'
import {
  TEST_SINGLE_ATTR_MESSAGE_NAME,
  TEST_MULTI_ATTR_MESSAGE_NAME,
} from './fixtures/messages'
import { test } from './fixtures/wrappers'
import { MessageFactoryForLogLine } from '../src/messages/types.js'
import { date } from 'zod'

describe('Repository', () => {
  test('Allows message factory to be selected by message name', ({
    repository,
  }) => {
    expect(
      repository.getFactory(TEST_MULTI_ATTR_MESSAGE_NAME).messageName
    ).toBe(TEST_MULTI_ATTR_MESSAGE_NAME)
    expect(
      repository.getFactory(TEST_SINGLE_ATTR_MESSAGE_NAME).messageName
    ).toBe(TEST_SINGLE_ATTR_MESSAGE_NAME)
  })

  test('Throws error if fetching factory for a message name that is not registered', ({
    repository,
  }) => {
    expect(
      // @ts-ignore
      () => repository.getFactory('doesnt exist')
    ).toThrow(MissingMessageTypeInRepository)
  })

  let string: string = 'asdasd'

  test('Correctly parses service message for registered single attribute message type', ({
    repository,
  }) => {
    const message = repository.parse(`##teamcity[${Date.now()} test='sad']`)
    const test = message.messageName()
  })
})
