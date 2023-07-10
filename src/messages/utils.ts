import type {
  MessageFactory,
  MultiAttributeMessage,
  SingleAttributeMessage,
} from './types.js'
import type {
  MultipleAttributeMessageFactory,
  SingleAttributeMessageFactory,
} from './builder/builder.js'

/** @category Message Builder */
export const isSingleAttributeMessageFactory = (
  factory: MessageFactory
): factory is SingleAttributeMessageFactory<any, any> =>
  factory.syntaxType === 'singleAttr'

/** @category Message Builder */
export const isMultiAttributeMessageFactory = (
  factory: MessageFactory
): factory is MultipleAttributeMessageFactory<any, any> =>
  factory.syntaxType === 'multiAttr'

/** @category Message Builder */
export const isMultiAttributeMessage = (
  message:
    | MultiAttributeMessage<any, any, any, any>
    | SingleAttributeMessage<any, any, any>
): message is MultiAttributeMessage<any, any, any, any> =>
  message.syntaxType() === 'multiAttr'

/** @category Message Builder */
export const isSingleAttributeMessage = (
  message:
    | MultiAttributeMessage<any, any, any, any>
    | SingleAttributeMessage<any, any, any>
): message is SingleAttributeMessage<any, any, any> =>
  message.syntaxType() === 'singleAttr'
