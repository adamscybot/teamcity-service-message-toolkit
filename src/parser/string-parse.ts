import {
  isMultiAttributeMessage,
  isSingleAttributeMessage,
} from '../messages/guards.js'
import { MessageTypeForLogLine } from '../messages/types.js'
import messages, { Messages } from '../messages/wrappers/default-messages.js'
import {
  TcBaseMessage,
  TcMultiAttributeMessage,
  TcSingleAttributeMessage,
} from '../messages/wrappers/base-message-types.js'

const TC_IDENT = '##teamcity'

export const formatArg = (value: string): string => `'${escape(value)}'`

export const formatKwarg = (key: string, value: string): string =>
  `${key}=${formatArg(value)}`

export const formatKwargs = (
  kwargs: Record<string, string | undefined>
): string =>
  Object.entries(kwargs).reduce(
    (paramString, [key, value]) =>
      value === undefined
        ? paramString
        : `${paramString} ${formatKwarg(key, value)}'`,
    ''
  )

export const buildServiceMessage = (
  messageName: string,
  body: string,
  flowId?: string
) =>
  `${TC_IDENT}[${messageName} ${
    flowId === undefined ? '' : `${formatKwarg('flowId', flowId)} `
  }${body}]`

export type TcLogLine = {
  messageName: string
  kwargs: Record<string, string>
  value?: string
}

export const desconstructMessageString = (line: string): TcLogLine | null => {
  const logLineRegex = /^##teamcity\[(\w+)\s+(.*)\]$/

  const match = line.match(logLineRegex)
  if (match) {
    const messageName = match[1]
    const parts = match[2].match(/(\w+)=\'[^\']*\'/g) || [] // Match parts with 'key=value' pattern
    const kwargs: Record<string, string> = {}
    let value: string | undefined

    for (let part of parts) {
      const [name, val] = part.split('=')

      if (val) {
        if (val[0] !== "'" || val[val.length - 1] !== "'") {
          throw new Error(
            `Invalid format of message "${line}". Value for ${name} must be wrapped in single quotes.`
          )
        }

        const unquotedValue = val.slice(1, -1) // Remove surrounding single quotes
        kwargs[name] = unescape(unquotedValue)
      } else {
        if (name[0] !== "'" || name[name.length - 1] !== "'") {
          throw new Error(
            `Invalid format of message "${line}". Single attribute value must be wrapped in single quotes.`
          )
        }

        value = unescape(name.slice(1, -1)) // Case when there is only a single attribute
      }
    }

    return {
      messageName: messageName,
      kwargs: kwargs,
      value: value,
    }
  }

  // Log line not recognised as a TC service message
  return null
}

export const messageFromLineFactory = <Line extends string>(
  line: Line,
  messages: Messages[]
): MessageTypeForLogLine<Line> | undefined => {
  try {
    const parsed = desconstructMessageString(line)
    if (parsed === null) return undefined

    const MessageClass = messages.find(
      (message) => message.messageName === parsed.messageName
    )

    if (!MessageClass) {
      let kwargCount = Object.keys(parsed.kwargs).length
      if (
        kwargCount > 1 ||
        (kwargCount === 1 && !parsed.kwargs.hasOwnProperty('flowId'))
      ) {
        console.warn(
          `Message of type '${parsed.messageName}' is unknown. Creating a generic multi attribute message representation.`
        )

        return new TcMultiAttributeMessage(
          parsed.kwargs,
          parsed.kwargs['flowId']
        ) as MessageTypeForLogLine<Line>
      } else {
        console.warn(
          `Message of type '${parsed.messageName}' is unknown. Creating a generic single attribute message representation.`
        )

        return new TcSingleAttributeMessage(
          parsed.value,
          parsed.kwargs['flowId']
        ) as MessageTypeForLogLine<Line>
      }
    }

    if (isMultiAttributeMessage(MessageClass)) {
      return new MessageClass(
        parsed.kwargs,
        parsed.kwargs['flowId']
      ) as MessageTypeForLogLine<Line>
    } else if (isSingleAttributeMessage(MessageClass)) {
      return new MessageClass(
        parsed.value,
        parsed.kwargs['flowId']
      ) as MessageTypeForLogLine<Line>
    }
  } catch (e) {
    console.error(e)
  }

  return undefined
}

export const defaultMessageFromLineFactory = <Line extends string>(
  line: Line
) => messageFromLineFactory<Line>(line, messages)

// From jest-teamcity project . Escapes in the way TC expects.
/**
Copyright (c) 2016 Ivan Tereshchenkov

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
 */
const escape = (str: string) => {
  if (!str) {
    return ''
  }

  return str
    .toString()
    .replace(/\x1B.*?m/g, '')
    .replace(/\|/g, '||')
    .replace(/\n/g, '|n')
    .replace(/\r/g, '|r')
    .replace(/\[/g, '|[')
    .replace(/\]/g, '|]')
    .replace(/\u0085/g, '|x')
    .replace(/\u2028/g, '|l')
    .replace(/\u2029/g, '|p')
    .replace(/'/g, "|'")
}

const unescape = (str: string) => {
  if (!str) {
    return ''
  }
  return str
    .toString()
    .replace(/\|\'/g, "'")
    .replace(/\|p/g, '\u2029')
    .replace(/\|l/g, '\u2028')
    .replace(/\|x/g, '\u0085')
    .replace(/\|\]/g, ']')
    .replace(/\|\[/g, '[')
    .replace(/\|r/g, '\r')
    .replace(/\|n/g, '\n')
    .replace(/\|\|/g, '|')
}
