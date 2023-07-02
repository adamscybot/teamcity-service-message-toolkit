import { test as originalTest } from 'vitest'
import {
  aMultiAttrMessageBuilder,
  aSingleAttrMessageBuilder,
  aMultiAttrMessageBuilderWithAttrs,
} from './messages'
import { aRepository } from './repository'

export const test = originalTest.extend<{
  singleAttrMessageBuilder: ReturnType<typeof aSingleAttrMessageBuilder>
  multiAttrMessageBuilder: ReturnType<typeof aMultiAttrMessageBuilder>
  multiAttrMessageBuilderWithAttrs: ReturnType<
    typeof aMultiAttrMessageBuilderWithAttrs
  >
  repository: ReturnType<typeof aRepository>
}>({
  singleAttrMessageBuilder: async (use) => {
    await use(aSingleAttrMessageBuilder())
  },
  multiAttrMessageBuilder: async (use) => {
    await use(aMultiAttrMessageBuilder())
  },
  multiAttrMessageBuilderWithAttrs: async (use) => {
    await use(aMultiAttrMessageBuilderWithAttrs())
  },
  repository: async (use) => {
    await use(aRepository())
  },
} as const)
