export enum TokenType {
    IDENT_START = 'IDENT_START',
    PARAMETERS_BLOCK_OPEN = 'PARAMETERS_BLOCK_OPEN',
    PARAMETERS_BLOCK_CLOSE = 'PARAMETERS_BLOCK_CLOSE',
    MESSAGE_NAME = 'MESSAGE_NAME',
    ATTRIBUTE_NAME = 'ATTRIBUTE_NAME',
    LITERAL = 'LITERAL',
    NONE_SERVICE_MESSAGE_TEXT = 'NONE_SERVICE_MESSAGE_TEXT',
  }
  
  type TokenObj<
    TokenType,
    AdditionalMetadata extends {} | undefined = undefined
  > = {
    type: TokenType
    contents: string
    metadata: {
      start: { line: number; col: number }
      end?: { line: number; col: number }
    } & AdditionalMetadata
  }
  
  export type Token =
    | TokenObj<TokenType.IDENT_START>
    | TokenObj<TokenType.PARAMETERS_BLOCK_OPEN>
    | TokenObj<TokenType.PARAMETERS_BLOCK_CLOSE>
    | TokenObj<TokenType.ATTRIBUTE_NAME>
    | TokenObj<TokenType.LITERAL, { unescapedContents: string }>
    | TokenObj<TokenType.NONE_SERVICE_MESSAGE_TEXT>
  
  
  const TOKENISER_REGEX_MAP: Record<TokenType, RegExp> = {
      ATTRIBUTE_NAME: //
  } as const
  
  export class TokeniserTransformStream extends TransformStream<string> {
      protected tokenRegex = 
    protected lastPushedToken: Token | null
  
    constructor() {
      let that = this
      super({
        start() {},
        async transform(chunk, controller) {
          chunk = await chunk
          switch (typeof chunk) {
            case 'object':
              if (chunk === null) {
                controller.terminate()
                return
              }
            case 'string':
              const buffer = [...chunk]
              while (buffer.length > 0) {
                  const char = paramsBuffer.shift()
              }
              break
            default:
              controller.error(
                `Cannot send ${typeof chunk} as an input to \`TokeniserTransformStream\``
              )
              break
          }
        },
      })
    }
  
    protected
  }
  