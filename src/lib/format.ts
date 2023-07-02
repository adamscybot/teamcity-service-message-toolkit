import { TC_IDENT } from './consts.js'
import { escape } from './escape.js'

const formatArg = (value?: string): string =>
  value !== undefined ? `'${escape(value)}'` : ''

const formatKwarg = (key: string, value: string): string =>
  `${key}=${formatArg(value)}`

const formatKwargs = (kwargs: Record<string, string | undefined>): string =>
  Object.entries(kwargs)
    .reduce(
      (paramString, [key, value]) =>
        value === undefined
          ? paramString
          : `${paramString} ${formatKwarg(key, value)}`,
      ''
    )
    .trim()

const wrapValue = (messageName: string, body: string, flowId?: string) =>
  `${TC_IDENT}[${messageName}${
    flowId === undefined ? '' : ` ${formatKwarg('flowId', flowId)}`
  }${body.length > 0 ? ` ${body}` : ''}]`

export const formatMultiAttrServiceMessage = (
  messageName: string,
  kwargs: Record<string, string | undefined>,
  flowId?: string
) => wrapValue(messageName, formatKwargs(kwargs), flowId)

export const formatSingleAttrServiceMessage = (
  messageName: string,
  value?: string,
  flowId?: string
) => wrapValue(messageName, formatArg(value), flowId)
