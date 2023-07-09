import { MessageTypeRepository } from '../../messages/types'
import { TokenTypes, type Token } from '../../tokeniser'

export type BasicMessageLiteral =
  | {
      type: 'multiAttr'
      messageName: string
      kwargs: Record<string, string>
    }
  | { type: 'singleAttr'; messageName: string; value: string }

type BasicMessageStreamChunkContainer<TypeName extends string, Payload> = {
  type: TypeName
  payload: Payload
  flowId: string
  meta: { _input: string; tokens: Token[] }
}

export type BasicMessageStreamMessageChunk = BasicMessageStreamChunkContainer<
  'message',
  BasicMessageLiteral
>
export type BasicMessageStreamErrorChunk = BasicMessageStreamChunkContainer<
  'error',
  {}
>

export type BasicMessageStreamOutputChunk = BasicMessageStreamChunkContainer<
  'output',
  string
>

export type BasicMessageStreamChunk =
  | BasicMessageStreamMessageChunk
  | BasicMessageStreamErrorChunk
  | BasicMessageStreamOutputChunk

class ParserTokenBuffer {
  private _rawTokenBuffer: Token[] = []
  private semanticTokenBuffer: Omit<Token, TokenTypes.SPACE>[] = []

  lookbehind(n: number = 0) {
    return (
      this.semanticTokenBuffer?.[this.semanticTokenBuffer.length - 1 - n] ??
      undefined
    )
  }

  rawBuffer() {
    return this._rawTokenBuffer
  }

  inputString() {
    return this.rawBuffer()
      .map((token) =>
        token.type === TokenTypes.STRING_ESCAPE_SINGLE_CHAR ||
        token.type === TokenTypes.STRING_ESCAPE_UNICODE
          ? token.value.original
          : token.value
      )
      .join('')
  }

  buffer() {
    return this.semanticTokenBuffer
  }

  push(token: Token) {
    this._rawTokenBuffer.push(token)
    if (token.type !== TokenTypes.SPACE) {
      this.semanticTokenBuffer.push(token)
    }
  }

  reset() {
    this._rawTokenBuffer = []
    this.semanticTokenBuffer = []
  }
}

export interface MessageStreamOpts<
  Repository extends MessageTypeRepository<any>
> {
  repository: Repository
  strict?: boolean
}

class BasicMessageTransformer
  implements Transformer<Token, BasicMessageStreamChunk>
{
  private tokenStack = new ParserTokenBuffer()
  private _currentFlowIdContext: string | undefined = undefined
  private _stagedMessage: Partial<BasicMessageLiteral> = {}
  private _stagedLiteral: string | undefined
  private _stagedPropertyName: string | undefined

  dropStaged() {
    this._stagedMessage = {}
    this._stagedLiteral = undefined
    this._stagedPropertyName = undefined
    this.tokenStack.reset()
  }

  enqueue(controller, chunk: Omit<BasicMessageStreamChunk, 'meta' | 'flowId'>) {
    controller.enqueue({
      ...chunk,
      flowId: this._currentFlowIdContext,
      meta: {
        _input: this.tokenStack.inputString(),
        tokens: this.tokenStack.rawBuffer(),
      },
    })
    this.dropStaged()
  }

  transform(token: Token, controller) {
    const lastToken = this.tokenStack.lookbehind()
    const lastSemanticType = lastToken?.type
    this.tokenStack.push(token)

    if (
      token.type === TokenTypes.NON_SERVICE_MESSAGE_OUTPUT ||
      token.type === TokenTypes.LINE_TERMINATION
    ) {
      this.enqueue(controller, { type: 'output', payload: token.value })
      return
    }

    if (token.type === TokenTypes.PARAMETERS_CLOSE) {
      if (
        lastSemanticType !== TokenTypes.STRING_END &&
        lastSemanticType !== TokenTypes.MESSAGE_NAME
      ) {
        this.enqueue(controller, { type: 'error', payload: 'Oh no' })
        return
      }

      if (
        this._stagedMessage.type === 'multiAttr' &&
        this._stagedMessage.kwargs?.flowId !== undefined
      ) {
        this._currentFlowIdContext = this._stagedMessage.kwargs.flowId
        delete this._stagedMessage.kwargs.flowId
      }

      this.enqueue(controller, {
        type: 'message',
        payload: this._stagedMessage,
      })
      return
    }

    if (token.type === TokenTypes.ERROR) {
      this.enqueue(controller, { type: 'error', payload: 'Oh no' })
      return
    }

    if (token.type === TokenTypes.MESSAGE_NAME) {
      this._stagedMessage.messageName = token.value
      return
    }

    if (token.type === TokenTypes.STRING_START) {
      if (lastSemanticType === TokenTypes.MESSAGE_NAME) {
        this._stagedMessage.type = 'singleAttr'
      }
      this._stagedLiteral = ''
      return
    }

    if (
      token.type === TokenTypes.STRING_ESCAPE_SINGLE_CHAR ||
      token.type === TokenTypes.STRING_ESCAPE_UNICODE
    ) {
      this._stagedLiteral += token.value.unescaped
      return
    }

    if (token.type === TokenTypes.STRING_VALUE) {
      this._stagedLiteral += token.value
    }

    if (token.type === TokenTypes.STRING_END) {
      if (this._stagedMessage.type === 'singleAttr') {
        this._stagedMessage.value = this._stagedLiteral!
        return
      }

      if (this._stagedMessage.type === 'multiAttr') {
        if (!this._stagedMessage.kwargs) this._stagedMessage.kwargs = {}
        this._stagedMessage.kwargs[this._stagedPropertyName!] =
          this._stagedLiteral!
      }
    }

    if (token.type === TokenTypes.PROPERTY_NAME) {
      console.log('!!!!!!!!!!!', token)
      if (lastSemanticType === TokenTypes.MESSAGE_NAME) {
        this._stagedMessage.type = 'multiAttr'
      }

      this._stagedPropertyName = token.value
      return
    }
  }

  flush(controller) {}
}

export class BasicMessageStream extends TransformStream<
  Token,
  BasicMessageStreamChunk
> {
  constructor() {
    super(new BasicMessageTransformer())
  }
}
