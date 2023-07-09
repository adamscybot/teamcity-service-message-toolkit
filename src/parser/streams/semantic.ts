import { factory } from 'typescript'
import {
  MessageFactory,
  MessageTypeRepository,
  MultiAttributeMessage,
  SingleAttributeMessage,
} from '../../messages/types'
import { BasicMessageStreamChunk, BasicMessageStreamOutputChunk } from './basic'
import { MissingMessageTypeInRepository } from '../../lib/errors'
import builder, {
  MultipleAttributeMessageFactory,
  SingleAttributeMessageFactory,
} from '../../messages/builder'

export type SemanticMessageStreamChunk =
  | BasicMessageStreamOutputChunk
  | SingleAttributeMessage<any, any>
  | MultiAttributeMessage<any, any>

export interface SemanticMessageStreamOpts<
  Repository extends MessageTypeRepository<any>
> {
  repository: Repository
  allowUnknownMessageTypes?: boolean
  validate?: boolean
}

class SemanticMessageTransformer<Repository extends MessageTypeRepository<any>>
  implements Transformer<BasicMessageStreamChunk, SemanticMessageStreamChunk>
{
  constructor(private opts: SemanticMessageStreamOpts<Repository>) {}

  transform(chunk: BasicMessageStreamChunk, controller) {
    if (chunk.type === 'message') {
      let factory:
        | SingleAttributeMessageFactory<string, any>
        | MultipleAttributeMessageFactory<string, any>
        | undefined

      try {
        factory = this.opts.repository.getFactory(chunk.payload.messageName)
      } catch (e) {
        if (
          this.opts.allowUnknownMessageTypes &&
          e instanceof MissingMessageTypeInRepository
        ) {
          if (chunk.payload.type === 'singleAttr') {
            factory = builder
              .name(chunk.payload.messageName)
              .singleAttribute()
              .build()
          } else if (chunk.payload.type === 'multiAttr') {
            factory = builder
              .name(chunk.payload.messageName)
              .multipleAttribute()
              .schema((builder) => builder.build())
              .build()
          }
        } else {
          throw e
        }
      }

      if (chunk.payload.type === 'multiAttr') {
        const message = factory?.({
          rawKwargs: chunk.payload.kwargs,
          flowId: chunk.flowId,
          rawValue: undefined,
        })
        try {
          message?.validate()
        } catch (e) {}

        controller.enqueue(message)
        return
      }

      if (chunk.payload.type === 'singleAttr') {
        const message = factory?.({
          rawValue: chunk.payload.value,
          flowId: chunk.flowId,
          rawKwargs: {},
        })
        try {
          message?.validate()
        } catch (e) {}
        controller.enqueue(message)
        return
      }
    }

    if (chunk.type === 'output') {
      controller.enqueue(chunk)
    }
  }

  flush(controller) {}
}

export class SemanticMessageStream<
  Repository extends MessageTypeRepository<any>
> extends TransformStream<BasicMessageStreamChunk, SemanticMessageStreamChunk> {
  constructor(opts: SemanticMessageStreamOpts<Repository>) {
    super(new SemanticMessageTransformer<Repository>(opts))
  }
}
