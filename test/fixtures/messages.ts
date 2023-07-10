import builder from '../../src/messages/builder/builder.js'

export const TEST_SINGLE_ATTR_MESSAGE_NAME = 'testSingleAttrMessage'

export const TEST_MULTI_ATTR_MESSAGE_NAME = 'testMultiAttrMessage'
export const TEST_MULTI_ATTR_MESSAGE_ATTR_1 = 'attr1'
export const TEST_MULTI_ATTR_MESSAGE_ATTR_2 = 'attr2'
export const TEST_MULTI_ATTR_MESSAGE_ATTR_3 = 'attr3'

export const aSingleAttrMessageBuilder = () =>
  builder.name(TEST_SINGLE_ATTR_MESSAGE_NAME).singleAttribute()

export const aMultiAttrMessageBuilder = () =>
  builder.name(TEST_MULTI_ATTR_MESSAGE_NAME).multipleAttribute()

export const aMultiAttrMessageBuilderWithAttrs = () =>
  aMultiAttrMessageBuilder().schema((schema) =>
    schema
      .attribute(TEST_MULTI_ATTR_MESSAGE_ATTR_1)
      .attribute(TEST_MULTI_ATTR_MESSAGE_ATTR_2)
      .attribute(TEST_MULTI_ATTR_MESSAGE_ATTR_3)
      .build()
  )
