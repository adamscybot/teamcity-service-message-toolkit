import { messageTypeRepository } from '../../src/messages/repository'
import {
  aMultiAttrMessageBuilderWithAttrs,
  aSingleAttrMessageBuilder,
} from './messages'

export const aRepository = () =>
  messageTypeRepository([
    aMultiAttrMessageBuilderWithAttrs().build(),
    aSingleAttrMessageBuilder().build(),
  ])
