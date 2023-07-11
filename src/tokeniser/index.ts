import { TokeniserStream } from './stream'
export { TokenTypes } from './lexer'

export type * from './stream'
export type * from './lexer'

export default {
  stream() {
    return new TokeniserStream()
  },
}
