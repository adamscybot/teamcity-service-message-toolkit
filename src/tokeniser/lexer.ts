import { Rule, Rules, states, Token as MooToken } from 'moo'
import { SINGLE_CHAR_ESCAPE_MAPPINGS, TC_IDENT } from '../lib/consts'

export type Token =
  | (Omit<MooToken, 'type'> & {
      type:
        | TokenTypes.SERVICE_MESSAGE_IDENT
        | TokenTypes.NON_SERVICE_MESSAGE_OUTPUT
        | TokenTypes.PARAMETERS_OPEN
        | TokenTypes.PARAMETERS_CLOSE
        | TokenTypes.MESSAGE_NAME
        | TokenTypes.SPACE
        | TokenTypes.PROPERTY_ASSIGN_OPERATOR
        | TokenTypes.PROPERTY_NAME
        | TokenTypes.STRING_START
        | TokenTypes.STRING_END
        | TokenTypes.STRING_VALUE
        | TokenTypes.LINE_TERMINATION
        | TokenTypes.ERROR
    })
  | (Omit<MooToken, 'type' | 'value'> & {
      type: TokenTypes.STRING_ESCAPE_SINGLE_CHAR
      value: WrappedLiteralTokenValue
    })
  | (Omit<MooToken, 'type' | 'value'> & {
      type: TokenTypes.STRING_ESCAPE_UNICODE
      value: WrappedLiteralTokenValue
    })

/** All the possible token types that can represent a message */
export enum TokenTypes {
  /** A token representing the starting service message identifier */
  SERVICE_MESSAGE_IDENT = 'serviceMessageIdent',
  /**
   * A token representing any string that is considered outside of the service
   * message
   */
  NON_SERVICE_MESSAGE_OUTPUT = 'nonServiceMessageOutput',
  /**
   * A token representing that the parameters block for the mssage has been
   * opened
   */
  PARAMETERS_OPEN = 'parametersOpen',
  /**
   * A token representing that the parameters block for the mssage has been
   * closed
   */
  PARAMETERS_CLOSE = 'parametersClose',
  /** A token representing the message name for the service message */
  MESSAGE_NAME = 'messageName',
  /** A token representing allowable space, that is used in appropriate places */
  SPACE = 'space',
  /**
   * A token representing the operator for assigning a attribute to a value in a
   * multi attribute message
   */
  PROPERTY_ASSIGN_OPERATOR = 'propertyAssignOperator',
  /** A token representing the name of an attribute in a multi attribute message */
  PROPERTY_NAME = 'propertyName',
  /** A token representing that a string literal has been opened */
  STRING_START = 'stringStart',
  /** A token representing that a string literal has been closed */
  STRING_END = 'stringEnd',
  /** A token representing the contents of a string literal */
  STRING_VALUE = 'stringValue',
  /** A token representing an escape sequence for a single character */
  STRING_ESCAPE_SINGLE_CHAR = 'stringEscapeSingleChar',
  /** A token representing an escape sequence for a unicode identifier */
  STRING_ESCAPE_UNICODE = 'stringEscapeUnicode',
  /**
   * A token representing that a new line was detected. Used for valid new lines
   * only (new lines inside service message are not allowed)
   */
  LINE_TERMINATION = 'lineTermination',
  /**
   * A token representing an error. Value will be the remaining input text after
   * error was encountered.
   */
  ERROR = 'error',
}

/** All the possible states in the internal stack of the lexer */
export enum TokeniserStates {
  EXPECT_IDENT_OR_STDOUT = 'expectIdentOrStdout',
  EXPECT_PARAMETERS_OPEN = 'expectParametersOpen',
  EXPECT_MESSAGE_NAME = 'expectMessageName',
  EXPECT_VALUES = 'expectValues',
  EXPECT_PARAMETERS_CLOSE = 'expectParametersClose',
  EXPECT_SINGLE_ATTRIBUTE_LITERAL = 'expectSingleAttributeLiteral',
  EXPECT_MULTIPLE_ATTRIBUTE_PROPERTY_LITERAL = 'expectMultipleAttributePropertyLiteral',
  EXPECT_MULTIPLE_ATTRIBUTE_PROPERTY_NAME = 'expectMultipleAttributePropertyName',
  EXPECT_MULTIPLE_ATTRIBUTES_ASSIGNMENT_OPERATOR = 'expectMultipleAttributesAssignmentOperator',
  EXPECT_MULTIPLE_ATTRIBUTE_PROPERTY_VALUE = 'expectMultipleAttributePropertyValue',
}

/**
 * A function which builds a {@link Rule}. It will usually have a base internal
 * implementation and will compose the provided overrides.
 *
 * @param opts The context from the caller, usually a partial {@link Rule} that
 *   represents specific variations needed by the caller. This normally
 *   overrides the base impl.
 * @returns The composed {@link Rule} that would be used in the original
 *   implementation for this token.
 */
export type RuleBuilderFn = (opts?: Rule) => Rule

export type TokeniserRuleOverrideFn = (
  /**
   * The original implementation of the function to fetch the rules for the
   * relevant token.
   *
   * @param baseImpl The context from the caller, usually a partial {@link Rule}
   *   that represents specific variations needed by the caller.
   * @param stage The {@link TokeniserStates} from which this rule builder was
   *   called.
   * @param opts The context from the caller, usually a partial {@link Rule} that
   *   represents specific variations needed by the caller. This normally
   *   overrides the base impl.
   * @returns The composed {@link Rule} that will be used for this token in place
   *   of the original implementation.
   */
  baseImpl: RuleBuilderFn,
  stage: TokeniserStates,
  opts?: Rule
) => Rule

// * @argument baseImpl The context from the caller, usually a partial {@link Rule} that represents
// *                specific variations needed by the caller.
// * @argument stage The {@link TokeniserStates} from which this rule builder was called.
// * @argument opts The context from the caller, usually a partial {@link Rule} that represents
// *                specific variations needed by the caller. This normally overrides the base impl.
export type TokenRuleBuilderOpts<
  AdditionalOpts extends Record<string, any> = {}
> = {
  push?: TokeniserStates
  next?: TokeniserStates
  error?: true
  state: TokeniserStates
  tokeniserOpts: TokeniserOpts
} & AdditionalOpts

/**
 * A function which defines how to build the rules for different tokens specific
 * to this library.
 *
 * @param opts The {@link TokenRuleBuilderOpts} that represent the configuration
 *   for this rule.
 * @returns The composed {@link Rule}.
 */
export type TokenRuleBuilder<AdditionalOpts extends Record<string, any> = {}> =
  (opts: TokenRuleBuilderOpts<AdditionalOpts>) => Rule

export type WrappedLiteralTokenValue = { unescaped: string; original: string }

const createLiteralTokenValue = (
  original: string,
  unescaped: string
): WrappedLiteralTokenValue => {
  const wrapper = { unescaped, original } as WrappedLiteralTokenValue
  return wrapper
}

const TOKEN_RULE_BUILDERS = {
  serviceMessageIdent: ({
    state,
    tokeniserOpts,
    ...opts
  }: TokenRuleBuilderOpts): Rule => ({
    match: tokeniserOpts.ident,
    ...opts,
  }),

  nonServiceMessageOutput: ({
    state,
    tokeniserOpts,
    ...opts
  }: TokenRuleBuilderOpts): Rule => ({
    // new RegExp(`.+?(?=${ident}|$)`),
    match: /.+?(?=##teamcity|$)/,
    ...opts,
  }),

  parametersOpen: ({
    state,
    tokeniserOpts,
    ...opts
  }: TokenRuleBuilderOpts): Rule => ({
    match: '[',
    ...opts,
  }),

  parametersClose: ({
    state,
    tokeniserOpts,
    ...opts
  }: TokenRuleBuilderOpts): Rule => ({
    match: ']',
    ...opts,
  }),

  stringStart: ({
    state,
    tokeniserOpts,
    ...opts
  }: TokenRuleBuilderOpts): Rule => ({
    match: "'",
    ...opts,
  }),

  stringEnd: ({
    state,
    tokeniserOpts,
    ...opts
  }: TokenRuleBuilderOpts): Rule => ({
    match: "'",
    ...opts,
  }),
  stringEscapeSingleChar: ({
    state,
    tokeniserOpts,
    ...opts
  }: TokenRuleBuilderOpts): Rule => ({
    match: /\|./,
    lineBreaks: false,
    value: (original) =>
      createLiteralTokenValue(
        original,
        SINGLE_CHAR_ESCAPE_MAPPINGS[original[1]] ?? original[1]
      ) as unknown as string,

    ...opts,
  }),

  stringEscapeUnicode: ({
    state,
    tokeniserOpts,
    ...opts
  }: TokenRuleBuilderOpts): Rule => ({
    match: /\|0x[0-9][0-9][0-9][0-9]/,
    value: (original) =>
      createLiteralTokenValue(
        original,
        String.fromCharCode(parseInt(original.slice(3), 16))
      ) as unknown as string,

    lineBreaks: false,
    ...opts,
  }),

  stringValue: ({
    state,
    tokeniserOpts,
    ...opts
  }: TokenRuleBuilderOpts): Rule => ({
    match: /[^'|\r\n]+/,
    lineBreaks: tokeniserOpts.allowNewLines,
    ...opts,
  }),

  space: ({
    state,
    tokeniserOpts,
    lookahead = '',
    ...opts
  }: TokenRuleBuilderOpts<{ lookahead?: string }>): Rule => ({
    ...(tokeniserOpts.allowNewLines
      ? { match: RegExp(`\s+${lookahead}`), lineBreaks: true, ...opts }
      : {
          match: RegExp(`[ \t\f\r]+${lookahead}`),
          lineBreaks: false,
          ...opts,
        }),
    ...opts,
  }),

  lineTermination: ({
    state,
    tokeniserOpts,
    ...opts
  }: TokenRuleBuilderOpts): Rule => ({
    match: /[\r\n|\r|\n]+$/,
    lineBreaks: true,
    ...opts,
  }),

  error: ({ state, tokeniserOpts, ...opts }: TokenRuleBuilderOpts): Rule => ({
    match: /./,
    lineBreaks: true,
    error: true,
    ...opts,
  }),

  propertyName: ({
    state,
    tokeniserOpts,
    ...opts
  }: TokenRuleBuilderOpts): Rule => ({
    match: /[A-z0-9:]+\s*(?==)/, // Only match if the propertyName is followed by any number of spaces (including 0) followed by a `=`
    ...opts,
  }),

  messageName: ({
    state,
    tokeniserOpts,
    ...opts
  }: TokenRuleBuilderOpts): Rule => ({
    match: /(?<=\[\s*)[A-z0-9]+(?=\s|\])/, // Only match if the messageName is preceded by any number of spaces (including 0) followed by a `[`
    lineBreaks: true,
    ...opts,
  }),

  propertyAssignOperator: ({
    state,
    tokeniserOpts,
    ...opts
  }: TokenRuleBuilderOpts): Rule => ({
    match: '=',
    ...opts,
  }),
} as const satisfies Record<TokenTypes, TokenRuleBuilderOpts<any>>

type TokenRuleBuilders = typeof TOKEN_RULE_BUILDERS

/**
 * The defaults are configured to match the specification. These options largely
 * exist for scenarios where it may be necessary to parse "dirty" input.
 */
export interface TokeniserOpts {
  /**
   * Allow a service message to spread across multiple lines.
   *
   * @defaultValue `false`
   */
  allowNewLines?: boolean
  /**
   * Change the default ident that is used to denote a service message.
   *
   * @defaultValue `'###teamcity'`
   */
  ident?: string

  /**
   * Enable or disable escaping of string literals according to the
   * specification.
   *
   * @defaultValue `true``
   */
  escapeLiterals?: boolean

  unsafeLooseParameters?: boolean

  /**
   * These options are unsupported and to be used at your own risk. It provides
   * an escape hatch that allows for selective replacement of the rules for each
   * base token.
   *
   * Should be set to an object literal that maps each {@link TokenType} of the
   * respective token builder that you desire to override to a function that
   * takes two arguments. The first argument is the original implementation for
   * this token builder, which you may optionally call. The second is the
   * options for this instantiation of the token builder.
   *
   * Note, depending on what is done, all other options to the tokeniser may be
   * made irrelevant.
   *
   * The syntax of the rules is provided by the Moo library.
   *
   * @example Use double quotes rather than single quotes for literals.
   *
   * ```ts
   * tokeniser({
   *   overrideTokenDefs: {
   *     stringStart: (baseImpl, opts) => ({
   *       ...baseImpl(op ts),
   *       match: '"',
   *     }),
   *   },
   * })
   * b
   *
   * @see https://github.com/no-context/moo
   * @see {@link TokenRuleBuilderOpts}
   * @see {@link TOKEN_RULE_BUILDERS} The original implementations
   * ```
   */
  overrideTokenDefs?: {
    [K in keyof TokenRuleBuilders]?: (
      /** The original implementation for this token builder */
      baseImpl: (opts: Parameters<TokenRuleBuilders[K]>[0]) => Rule,
      /**
       * The options for this instantiation of the token builder, derived from
       * {@link TokenRuleBuilderOpts}
       */
      opts: Parameters<TokenRuleBuilders[K]>[0]
    ) => TokenRuleBuilders[K]
  }
}

type BoundTokenRuleBuilders = {
  [K in keyof TokenRuleBuilders]: (
    opts: Omit<Parameters<TokenRuleBuilders[K]>[0], 'tokeniserOpts'>
  ) => { [L in K]: Rule }
}

export const tokeniser = ({
  allowNewLines = false,
  escapeLiterals = true,
  ident = TC_IDENT,
  overrideTokenDefs = {},
  unsafeLooseParameters = false,
}: TokeniserOpts = {}) => {
  const tokeniserOpts = {
    allowNewLines,
    escapeLiterals,
    ident,
    overrideTokenDefs,
    unsafeLooseParameters,
  }

  const boundTokenRuleBuilders = (
    Object.keys(TOKEN_RULE_BUILDERS) as Array<keyof TokenRuleBuilders>
  ).reduce<BoundTokenRuleBuilders>((result, key) => {
    const baseImpl = TOKEN_RULE_BUILDERS[key]
    const overriddenImpl = overrideTokenDefs[key]

    type BoundOpts = Omit<
      Parameters<TokenRuleBuilders[keyof TokenRuleBuilders]>[0],
      'tokeniserOpts'
    >

    const boundImpl = overriddenImpl
      ? (opts: BoundOpts) => ({
          [key]: overriddenImpl(baseImpl, { ...opts, tokeniserOpts }),
        })
      : (opts: BoundOpts) => {
          return { [key]: baseImpl({ ...opts, tokeniserOpts }) }
        }

    return { ...result, [key]: boundImpl }
  }, {} as BoundTokenRuleBuilders)

  const literal = (
    {
      stringEscapeUnicode,
      stringEscapeSingleChar,
      stringEnd,
      stringValue,
      error,
    }: Pick<
      StateBoundRuleBuilder,
      | 'stringEscapeUnicode'
      | 'stringEscapeSingleChar'
      | 'stringEnd'
      | 'stringValue'
      | 'error'
    >,
    { next }: { next: TokeniserStates }
  ) => ({
    ...stringEscapeUnicode(),
    ...stringEscapeSingleChar(),
    ...stringEnd({ next }),
    ...stringValue(),
    ...error(),
  })

  type StateBoundRuleBuilder = {
    [K in keyof typeof boundTokenRuleBuilders]: (
      opts?: Omit<Parameters<(typeof boundTokenRuleBuilders)[K]>[0], 'state'>
    ) => { [L in K]: Rule }
  }

  const state = (
    state: TokeniserStates,
    cb: (builders: {
      [K in keyof typeof boundTokenRuleBuilders]: (
        opts?: Omit<Parameters<(typeof boundTokenRuleBuilders)[K]>[0], 'state'>
      ) => { [L in K]: Rule }
    }) => Partial<Record<TokenTypes, Rule>>
  ): Partial<{
    [key in TokeniserStates]: Partial<Record<TokenTypes, Rule>>
  }> => {
    return {
      [state]: cb(
        Object.entries(boundTokenRuleBuilders).reduce(
          (stateBoundTokenRuleBuilders, [name, builder]) => ({
            ...stateBoundTokenRuleBuilders,
            [name]: (
              opts?: Omit<
                Parameters<
                  (typeof boundTokenRuleBuilders)[keyof typeof boundTokenRuleBuilders]
                >[0],
                'state'
              >
            ) => builder({ ...opts, state }),
          }),
          {} as Record<
            keyof typeof boundTokenRuleBuilders,
            (
              opts?: Omit<
                Parameters<
                  (typeof boundTokenRuleBuilders)[keyof typeof boundTokenRuleBuilders]
                >[0],
                'state'
              >
            ) => Record<TokenTypes, Rule>
          >
        )
      ),
    }
  }

  return states({
    ...state(
      TokeniserStates.EXPECT_IDENT_OR_STDOUT,
      ({ serviceMessageIdent, nonServiceMessageOutput, lineTermination }) => ({
        ...serviceMessageIdent({
          push: TokeniserStates.EXPECT_PARAMETERS_OPEN,
        }),
        ...lineTermination(),
        ...nonServiceMessageOutput(),
      })
    ),

    ...state(
      TokeniserStates.EXPECT_PARAMETERS_OPEN,
      ({ parametersOpen, error }) => ({
        ...parametersOpen({ push: TokeniserStates.EXPECT_MESSAGE_NAME }),
        ...error(),
      })
    ),

    ...state(
      TokeniserStates.EXPECT_MESSAGE_NAME,
      ({ parametersClose, messageName, space, error }) => ({
        ...messageName({ push: TokeniserStates.EXPECT_VALUES }),
        ...space(),
        ...parametersClose({ push: TokeniserStates.EXPECT_IDENT_OR_STDOUT }),
        ...error(),
      })
    ),

    ...state(
      TokeniserStates.EXPECT_VALUES,
      ({ stringStart, propertyName, space, parametersClose, error }) => ({
        ...parametersClose({ push: TokeniserStates.EXPECT_IDENT_OR_STDOUT }),
        ...stringStart({
          next: TokeniserStates.EXPECT_SINGLE_ATTRIBUTE_LITERAL,
        }),
        ...propertyName({
          push: TokeniserStates.EXPECT_MULTIPLE_ATTRIBUTES_ASSIGNMENT_OPERATOR,
        }),
        ...space(),
        ...error(),
      })
    ),

    ...state(
      TokeniserStates.EXPECT_PARAMETERS_CLOSE,
      ({ space, parametersClose, error }) => ({
        ...space(),
        ...parametersClose({ push: TokeniserStates.EXPECT_IDENT_OR_STDOUT }),
        ...error(),
      })
    ),

    ...state(TokeniserStates.EXPECT_SINGLE_ATTRIBUTE_LITERAL, (builders) =>
      literal(builders, {
        next: TokeniserStates.EXPECT_PARAMETERS_CLOSE,
      })
    ),

    ...state(
      TokeniserStates.EXPECT_MULTIPLE_ATTRIBUTE_PROPERTY_NAME,
      ({ propertyName, parametersClose, space, error }) => ({
        ...parametersClose({ push: TokeniserStates.EXPECT_IDENT_OR_STDOUT }),
        ...propertyName({
          push: TokeniserStates.EXPECT_MULTIPLE_ATTRIBUTES_ASSIGNMENT_OPERATOR,
        }),
        ...space(),
        ...error(),
      })
    ),

    ...state(
      TokeniserStates.EXPECT_MULTIPLE_ATTRIBUTES_ASSIGNMENT_OPERATOR,
      ({ propertyAssignOperator, space, error, parametersClose }) => ({
        ...space(),
        ...propertyAssignOperator({
          push: TokeniserStates.EXPECT_MULTIPLE_ATTRIBUTE_PROPERTY_VALUE,
        }),
        ...parametersClose({ push: TokeniserStates.EXPECT_IDENT_OR_STDOUT }),
        ...error(),
      })
    ),

    ...state(
      TokeniserStates.EXPECT_MULTIPLE_ATTRIBUTE_PROPERTY_VALUE,
      ({ stringStart, space, error, parametersClose }) => ({
        ...space(),
        ...stringStart({
          next: TokeniserStates.EXPECT_MULTIPLE_ATTRIBUTE_PROPERTY_LITERAL,
        }),
        ...parametersClose({ push: TokeniserStates.EXPECT_IDENT_OR_STDOUT }),
        ...error({ push: TokeniserStates.EXPECT_PARAMETERS_CLOSE }),
      })
    ),

    ...state(
      TokeniserStates.EXPECT_MULTIPLE_ATTRIBUTE_PROPERTY_LITERAL,
      (builders) =>
        literal(builders, {
          next: TokeniserStates.EXPECT_MULTIPLE_ATTRIBUTE_PROPERTY_NAME,
        })
    ),
  } satisfies Record<string, Partial<Record<TokenTypes, Rules[string]>>>)
}
