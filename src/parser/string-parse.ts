import { escape } from '../lib/escape.js'
import { InvalidServiceMessageFormat } from '../lib/errors.js'

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

    for (const part of parts) {
      const [name, val] = part.split('=')

      if (val) {
        if (val[0] !== "'" || val[val.length - 1] !== "'") {
          throw new InvalidServiceMessageFormat(
            line,
            // @ts-ignore temp
            `Value for ${name} must be wrapped in single quotes.`
          )
        }

        const unquotedValue = val.slice(1, -1) // Remove surrounding single quotes
        kwargs[name] = unescape(unquotedValue)
      } else {
        if (name[0] !== "'" || name[name.length - 1] !== "'") {
          throw new InvalidServiceMessageFormat(
            line,
            // @ts-ignore temp
            `Single attribute value must be wrapped in single quotes.`
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
