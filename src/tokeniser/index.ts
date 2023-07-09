import { TokeniserStream } from './stream'
import { TokeniserOpts } from './lexer'
export { TokenTypes } from './lexer'

export type * from './stream'
export type * from './lexer'

export default {
  stream(opts?: TokeniserOpts) {
    return new TokeniserStream()
  },
}
