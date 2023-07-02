import { Rule, Rules, states } from 'moo'

const TC_IDENT = '##teamcity'

/**
 * The defaults are configured to match the specification. These options largely exist
 * for scenarios where it may be necessary to parse "dirty" input.
 * */
export interface TokeniserOpts {
  /**
   * Allow a service message to spread across multiple lines.
   *
   * @default false
   **/
  allowNewLines?: boolean
  /**
   * Change the default ident that is used to denote a service message.
   *
   * @default "###teamcity"
   **/
  ident?: string
  /**
   *
   */
  unsafeLooseParameters?: boolean

  overrideTokenDefs?: Partial<
    Record<TokenTypes, (baseImpl: (opts?: Rule) => Rule, opts?: Rule) => Rule>
  >
}

export enum TokenTypes {
  SERVICE_MESSAGE_IDENT = 'serviceMessageIdent',
  NON_SERVICE_MESSAGE_OUTPUT = 'nonServiceMessageOutput',
  PARAMETERS_OPEN = 'paramatersOpen',
  PARAMETERS_CLOSE = 'paramatersClose',
  MESSAGE_NAME = 'messageName',
  SPACE = 'space',
  PROPERTY_ASSIGN_OPERATOR = 'propertyAssignOperator',
  PROPERTY_NAME = 'propertyName',
  STRING_START = 'stringStart',
  STRING_END = 'stringEnd',
  STRING_VALUE = 'stringValue',
  STRING_ESCAPE_SINGLE_CHAR = 'stringEscapeSingleChar',
  STRING_SCAPE_UNICODE = 'stringEscapeUnicode',
}

export enum TokeniserStages {
  MAIN = 'main',
  SERVICE_MESSAGE = 'serviceMessage',
  PARAMETERS = 'parameters',
  VALUES = 'values',
  FORCE_MESSAGE_END = 'forceMessageEnd',
  SINGLE_ATTR_LITERAL = 'singleAttrLiteral',
  MULTI_ATTR_LITERAL = 'multiAttrLiteral',
  MULTIPLE_ATTRIBUTES_PROPERTY = 'multiAttributesProperty',
  MULTIPLE_ATTRIBUTES_PROPERTY_ASSIGNMENT = 'multiAttributesPropertyAssignment',
  MULTIPLE_ATTRIBUTES_PROPERY_RHS = 'multiAttributesPropertyRhs',
}

export const tokeniser = ({
  ident: identString = TC_IDENT,
  allowNewLines = false,
  overrideTokenDefs = {},
}: TokeniserOpts = {}) => {
  const getOverrideableTokenDef = <TokenType extends TokenTypes>(
    type: TokenType,
    impl: (opts?: Rule) => Rule
  ) => {
    const overrideFn = overrideTokenDefs[type]
    if (overrideFn) return (opts?: Rule) => ({ [type]: overrideFn(impl, opts) })
    return (opts?: Rule) => ({ [type]: impl(opts) })
  }

  const ident = getOverrideableTokenDef(
    TokenTypes.SERVICE_MESSAGE_IDENT,
    (opts?: Rule) => ({
      match: identString,
      ...opts,
    })
  )

  const nonServiceMessageOutput = getOverrideableTokenDef(
    TokenTypes.NON_SERVICE_MESSAGE_OUTPUT,
    (opts?: Rule) => ({
      // new RegExp(`.+?(?=${ident}|$)`),
      match: /.+?(?=##teamcity|$)/,
      ...opts,
    })
  )

  const paramatersOpen = getOverrideableTokenDef(
    TokenTypes.PARAMETERS_OPEN,
    (opts?: Rule) => ({
      match: '[',
      ...opts,
    })
  )

  const paramatersClose = getOverrideableTokenDef(
    TokenTypes.PARAMETERS_CLOSE,
    (opts?: Rule) => ({
      match: ']',
      ...opts,
    })
  )

  const stringStart = getOverrideableTokenDef(
    TokenTypes.STRING_START,
    (opts?: Rule) => ({
      match: "'",
      ...opts,
    })
  )

  const stringEnd = getOverrideableTokenDef(
    TokenTypes.STRING_END,
    (opts?: Rule) => ({
      match: "'",
      ...opts,
    })
  )

  const stringEscapeSingleChar = getOverrideableTokenDef(
    TokenTypes.STRING_ESCAPE_SINGLE_CHAR,
    (opts?: Rule) => ({
      match: /\|./,
      lineBreaks: false,
      ...opts,
    })
  )

  const stringEscapeUnicode = getOverrideableTokenDef(
    TokenTypes.STRING_SCAPE_UNICODE,
    (opts?: Rule) => ({
      match: /\|0x[0-9][0-9][0-9][0-9]/,
      lineBreaks: false,
      ...opts,
    })
  )

  const stringValue = getOverrideableTokenDef(
    TokenTypes.STRING_VALUE,
    (opts?: Rule) => ({
      match: /(?<!\|)[^'|\r\n]+/,
      lineBreaks: allowNewLines,
      ...opts,
    })
  )

  const space = getOverrideableTokenDef(TokenTypes.SPACE, (opts?: Rule) => ({
    ...(allowNewLines
      ? { match: /\s+/, lineBreaks: true, ...opts }
      : { match: /[ \t\f\r]+/, lineBreaks: false, ...opts }),
    ...opts,
  }))

  const propertyName = getOverrideableTokenDef(
    TokenTypes.PROPERTY_NAME,
    (opts?: Rule) => ({
      match: /[A-z0-9]+/,
      ...opts,
    })
  )

  const messageName = getOverrideableTokenDef(
    TokenTypes.MESSAGE_NAME,
    (opts?: Rule) => ({
      match: /[A-z0-9]+/,
      lineBreaks: true,
      ...opts,
    })
  )

  const propertyAssignmentOperator = getOverrideableTokenDef(
    TokenTypes.PROPERTY_ASSIGN_OPERATOR,
    (opts?: Rule) => ({
      match: '=',
      ...opts,
    })
  )

  const literal = ({ next }: { next: TokeniserStages }) => ({
    ...stringEscapeUnicode(),
    ...stringEscapeSingleChar(),
    ...stringEnd({ next }),
    ...stringValue(),
  })

  return states({
    [TokeniserStages.MAIN]: {
      ...ident({ push: TokeniserStages.SERVICE_MESSAGE }),
      ...nonServiceMessageOutput(),
    },
    [TokeniserStages.SERVICE_MESSAGE]: {
      ...paramatersOpen({ push: TokeniserStages.PARAMETERS }),
    },
    [TokeniserStages.PARAMETERS]: {
      ...paramatersClose({ push: TokeniserStages.MAIN }),
      ...messageName(),
      ...space({ push: 'values' }),
    },
    [TokeniserStages.VALUES]: {
      ...stringStart({ next: TokeniserStages.SINGLE_ATTR_LITERAL }),
      ...propertyName({
        push: TokeniserStages.MULTIPLE_ATTRIBUTES_PROPERTY_ASSIGNMENT,
      }),
      ...space(),
    },
    [TokeniserStages.FORCE_MESSAGE_END]: {
      ...space(),
      ...paramatersClose({ push: TokeniserStages.MAIN }),
    },
    [TokeniserStages.SINGLE_ATTR_LITERAL]: literal({
      next: TokeniserStages.FORCE_MESSAGE_END,
    }),
    [TokeniserStages.MULTIPLE_ATTRIBUTES_PROPERTY]: {
      ...paramatersClose({ push: TokeniserStages.MAIN }),
      ...propertyName({
        push: TokeniserStages.MULTIPLE_ATTRIBUTES_PROPERTY_ASSIGNMENT,
      }),
      ...space(),
    },
    [TokeniserStages.MULTIPLE_ATTRIBUTES_PROPERTY_ASSIGNMENT]: {
      ...space(),
      ...propertyAssignmentOperator({
        push: TokeniserStages.MULTIPLE_ATTRIBUTES_PROPERY_RHS,
      }),
    },
    [TokeniserStages.MULTIPLE_ATTRIBUTES_PROPERY_RHS]: {
      ...space(),
      ...stringStart({ next: TokeniserStages.MULTI_ATTR_LITERAL }),
    },
    [TokeniserStages.MULTI_ATTR_LITERAL]: literal({
      next: TokeniserStages.MULTIPLE_ATTRIBUTES_PROPERTY,
    }),
  } satisfies Record<TokeniserStages, Partial<Record<TokenTypes, Rules[string]>>>)
}
