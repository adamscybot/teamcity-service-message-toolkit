import {
  multiAttributeMessages,
  singleAttributeMessages,
} from './wrappers/default-messages.js'

export const isMultiAttributeMessage = (
  obj: any
): obj is (typeof multiAttributeMessages)[0] =>
  (multiAttributeMessages as readonly any[]).indexOf(obj) !== -1

export const isSingleAttributeMessage = (
  obj: any
): obj is (typeof singleAttributeMessages)[0] =>
  (singleAttributeMessages as readonly any[]).indexOf(obj) !== -1
