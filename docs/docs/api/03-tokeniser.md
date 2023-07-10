---
sidebar_label: tokeniser
---

# Module: tokeniser

## Enumerations

### TokenTypes

All the possible token types that can represent a message

#### Enumeration Members

##### ERROR

> **ERROR**: `"error"`

A token representing an error. Value will be the remaining input text after
error was encountered.

###### Source

[src/tokeniser/lexer.ts:79](https://github.com/adamscybot/tc-message-toolkit/blob/4e7c9a6/src/tokeniser/lexer.ts#L79)

---

##### LINE_TERMINATION

> **LINE_TERMINATION**: `"lineTermination"`

A token representing that a new line was detected. Used for valid new lines
only (new lines inside service message are not allowed)

###### Source

[src/tokeniser/lexer.ts:74](https://github.com/adamscybot/tc-message-toolkit/blob/4e7c9a6/src/tokeniser/lexer.ts#L74)

---

##### MESSAGE_NAME

> **MESSAGE_NAME**: `"messageName"`

A token representing the message name for the service message

###### Source

[src/tokeniser/lexer.ts:50](https://github.com/adamscybot/tc-message-toolkit/blob/4e7c9a6/src/tokeniser/lexer.ts#L50)

---

##### NON_SERVICE_MESSAGE_OUTPUT

> **NON_SERVICE_MESSAGE_OUTPUT**: `"nonServiceMessageOutput"`

A token representing any string that is considered outside of the service
message

###### Source

[src/tokeniser/lexer.ts:38](https://github.com/adamscybot/tc-message-toolkit/blob/4e7c9a6/src/tokeniser/lexer.ts#L38)

---

##### PARAMETERS_CLOSE

> **PARAMETERS_CLOSE**: `"parametersClose"`

A token representing that the parameters block for the mssage has been
closed

###### Source

[src/tokeniser/lexer.ts:48](https://github.com/adamscybot/tc-message-toolkit/blob/4e7c9a6/src/tokeniser/lexer.ts#L48)

---

##### PARAMETERS_OPEN

> **PARAMETERS_OPEN**: `"parametersOpen"`

A token representing that the parameters block for the mssage has been
opened

###### Source

[src/tokeniser/lexer.ts:43](https://github.com/adamscybot/tc-message-toolkit/blob/4e7c9a6/src/tokeniser/lexer.ts#L43)

---

##### PROPERTY_ASSIGN_OPERATOR

> **PROPERTY_ASSIGN_OPERATOR**: `"propertyAssignOperator"`

A token representing the operator for assigning a attribute to a value in a
multi attribute message

###### Source

[src/tokeniser/lexer.ts:57](https://github.com/adamscybot/tc-message-toolkit/blob/4e7c9a6/src/tokeniser/lexer.ts#L57)

---

##### PROPERTY_NAME

> **PROPERTY_NAME**: `"propertyName"`

A token representing the name of an attribute in a multi attribute message

###### Source

[src/tokeniser/lexer.ts:59](https://github.com/adamscybot/tc-message-toolkit/blob/4e7c9a6/src/tokeniser/lexer.ts#L59)

---

##### SERVICE_MESSAGE_IDENT

> **SERVICE_MESSAGE_IDENT**: `"serviceMessageIdent"`

A token representing the starting service message identifier

###### Source

[src/tokeniser/lexer.ts:33](https://github.com/adamscybot/tc-message-toolkit/blob/4e7c9a6/src/tokeniser/lexer.ts#L33)

---

##### SPACE

> **SPACE**: `"space"`

A token representing allowable space, that is used in appropriate places

###### Source

[src/tokeniser/lexer.ts:52](https://github.com/adamscybot/tc-message-toolkit/blob/4e7c9a6/src/tokeniser/lexer.ts#L52)

---

##### STRING_END

> **STRING_END**: `"stringEnd"`

A token representing that a string literal has been closed

###### Source

[src/tokeniser/lexer.ts:63](https://github.com/adamscybot/tc-message-toolkit/blob/4e7c9a6/src/tokeniser/lexer.ts#L63)

---

##### STRING_ESCAPE_SINGLE_CHAR

> **STRING_ESCAPE_SINGLE_CHAR**: `"stringEscapeSingleChar"`

A token representing an escape sequence for a single character

###### Source

[src/tokeniser/lexer.ts:67](https://github.com/adamscybot/tc-message-toolkit/blob/4e7c9a6/src/tokeniser/lexer.ts#L67)

---

##### STRING_ESCAPE_UNICODE

> **STRING_ESCAPE_UNICODE**: `"stringEscapeUnicode"`

A token representing an escape sequence for a unicode identifier

###### Source

[src/tokeniser/lexer.ts:69](https://github.com/adamscybot/tc-message-toolkit/blob/4e7c9a6/src/tokeniser/lexer.ts#L69)

---

##### STRING_START

> **STRING_START**: `"stringStart"`

A token representing that a string literal has been opened

###### Source

[src/tokeniser/lexer.ts:61](https://github.com/adamscybot/tc-message-toolkit/blob/4e7c9a6/src/tokeniser/lexer.ts#L61)

---

##### STRING_VALUE

> **STRING_VALUE**: `"stringValue"`

A token representing the contents of a string literal

###### Source

[src/tokeniser/lexer.ts:65](https://github.com/adamscybot/tc-message-toolkit/blob/4e7c9a6/src/tokeniser/lexer.ts#L65)

---

### TokeniserStates

All the possible states in the internal stack of the lexer

#### Enumeration Members

##### EXPECT_IDENT_OR_STDOUT

> **EXPECT_IDENT_OR_STDOUT**: `"expectIdentOrStdout"`

###### Source

[src/tokeniser/lexer.ts:84](https://github.com/adamscybot/tc-message-toolkit/blob/4e7c9a6/src/tokeniser/lexer.ts#L84)

---

##### EXPECT_MESSAGE_NAME

> **EXPECT_MESSAGE_NAME**: `"expectMessageName"`

###### Source

[src/tokeniser/lexer.ts:86](https://github.com/adamscybot/tc-message-toolkit/blob/4e7c9a6/src/tokeniser/lexer.ts#L86)

---

##### EXPECT_MULTIPLE_ATTRIBUTES_ASSIGNMENT_OPERATOR

> **EXPECT_MULTIPLE_ATTRIBUTES_ASSIGNMENT_OPERATOR**: `"expectMultipleAttributesAssignmentOperator"`

###### Source

[src/tokeniser/lexer.ts:92](https://github.com/adamscybot/tc-message-toolkit/blob/4e7c9a6/src/tokeniser/lexer.ts#L92)

---

##### EXPECT_MULTIPLE_ATTRIBUTE_PROPERTY_LITERAL

> **EXPECT_MULTIPLE_ATTRIBUTE_PROPERTY_LITERAL**: `"expectMultipleAttributePropertyLiteral"`

###### Source

[src/tokeniser/lexer.ts:90](https://github.com/adamscybot/tc-message-toolkit/blob/4e7c9a6/src/tokeniser/lexer.ts#L90)

---

##### EXPECT_MULTIPLE_ATTRIBUTE_PROPERTY_NAME

> **EXPECT_MULTIPLE_ATTRIBUTE_PROPERTY_NAME**: `"expectMultipleAttributePropertyName"`

###### Source

[src/tokeniser/lexer.ts:91](https://github.com/adamscybot/tc-message-toolkit/blob/4e7c9a6/src/tokeniser/lexer.ts#L91)

---

##### EXPECT_MULTIPLE_ATTRIBUTE_PROPERTY_VALUE

> **EXPECT_MULTIPLE_ATTRIBUTE_PROPERTY_VALUE**: `"expectMultipleAttributePropertyValue"`

###### Source

[src/tokeniser/lexer.ts:93](https://github.com/adamscybot/tc-message-toolkit/blob/4e7c9a6/src/tokeniser/lexer.ts#L93)

---

##### EXPECT_PARAMETERS_CLOSE

> **EXPECT_PARAMETERS_CLOSE**: `"expectParametersClose"`

###### Source

[src/tokeniser/lexer.ts:88](https://github.com/adamscybot/tc-message-toolkit/blob/4e7c9a6/src/tokeniser/lexer.ts#L88)

---

##### EXPECT_PARAMETERS_OPEN

> **EXPECT_PARAMETERS_OPEN**: `"expectParametersOpen"`

###### Source

[src/tokeniser/lexer.ts:85](https://github.com/adamscybot/tc-message-toolkit/blob/4e7c9a6/src/tokeniser/lexer.ts#L85)

---

##### EXPECT_SINGLE_ATTRIBUTE_LITERAL

> **EXPECT_SINGLE_ATTRIBUTE_LITERAL**: `"expectSingleAttributeLiteral"`

###### Source

[src/tokeniser/lexer.ts:89](https://github.com/adamscybot/tc-message-toolkit/blob/4e7c9a6/src/tokeniser/lexer.ts#L89)

---

##### EXPECT_VALUES

> **EXPECT_VALUES**: `"expectValues"`

###### Source

[src/tokeniser/lexer.ts:87](https://github.com/adamscybot/tc-message-toolkit/blob/4e7c9a6/src/tokeniser/lexer.ts#L87)

## Classes

### TokeniserStream

#### Extends

- `TransformStream`< `string`, [`Token`](03-tokeniser.md#token) \>

#### Constructors

##### constructor()

> **new TokeniserStream**(`opts`?): [`TokeniserStream`](03-tokeniser.md#tokeniserstream)

###### Parameters

| Parameter | Type                                             |
| :-------- | :----------------------------------------------- |
| `opts`?   | [`TokeniserOpts`](03-tokeniser.md#tokeniseropts) |

###### Returns

[`TokeniserStream`](03-tokeniser.md#tokeniserstream)

###### Overrides

TransformStream<string, Token\>.constructor

###### Source

[src/tokeniser/stream.ts:53](https://github.com/adamscybot/tc-message-toolkit/blob/4e7c9a6/src/tokeniser/stream.ts#L53)

#### Properties

##### readable

> `readonly` **readable**: `ReadableStream`< [`Token`](03-tokeniser.md#token) \>

###### Source

node_modules/.pnpm/@types+node@20.1.3/node_modules/@types/node/stream/web.d.ts:189

###### Inherited from

TransformStream.readable

---

##### writable

> `readonly` **writable**: `WritableStream`< `string` \>

###### Source

node_modules/.pnpm/@types+node@20.1.3/node_modules/@types/node/stream/web.d.ts:190

###### Inherited from

TransformStream.writable

## Interfaces

### TokeniserOpts

The defaults are configured to match the specification. These options largely
exist for scenarios where it may be necessary to parse "dirty" input.

#### Properties

##### allowNewLines

> `optional` **allowNewLines**: `boolean`

Allow a service message to spread across multiple lines.

###### Default Value

`false`

###### Source

[src/tokeniser/lexer.ts:336](https://github.com/adamscybot/tc-message-toolkit/blob/4e7c9a6/src/tokeniser/lexer.ts#L336)

---

##### escapeLiterals

> `optional` **escapeLiterals**: `boolean`

Enable or disable escaping of string literals according to the
specification.

###### Default Value

`true``

###### Source

[src/tokeniser/lexer.ts:350](https://github.com/adamscybot/tc-message-toolkit/blob/4e7c9a6/src/tokeniser/lexer.ts#L350)

---

##### ident

> `optional` **ident**: `string`

Change the default ident that is used to denote a service message.

###### Default Value

`'###teamcity'`

###### Source

[src/tokeniser/lexer.ts:342](https://github.com/adamscybot/tc-message-toolkit/blob/4e7c9a6/src/tokeniser/lexer.ts#L342)

---

##### overrideTokenDefs

> `optional` **overrideTokenDefs**: `object`

These options are unsupported and to be used at your own risk. It provides
an escape hatch that allows for selective replacement of the rules for each
base token.

Should be set to an object literal that maps each TokenType of the
respective token builder that you desire to override to a function that
takes two arguments. The first argument is the original implementation for
this token builder, which you may optionally call. The second is the
options for this instantiation of the token builder.

Note, depending on what is done, all other options to the tokeniser may be
made irrelevant.

The syntax of the rules is provided by the Moo library.

###### Example

Use double quotes rather than single quotes for literals.

```ts
tokeniser({
  overrideTokenDefs: {
    stringStart: (baseImpl, opts) => ({
      ...baseImpl(op ts),
      match: '"',
    }),
  },
})
b

@see https://github.com/no-context/moo
@see {@link TokenRuleBuilderOpts}
@see {@link TOKEN_RULE_BUILDERS} The original implementations
```

###### Type declaration

> ###### overrideTokenDefs.error
>
> `optional` `readonly` **error**: (`baseImpl`, `opts`) => (`__namedParameters`) => `Rule`
>
> ###### Parameters
>
> | Parameter            | Type                                                 | Description                                                                                                                             |
> | :------------------- | :--------------------------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------- |
> | `baseImpl`           | (`opts`) => `Rule`                                   | The original implementation for this token builder                                                                                      |
> | `opts`               | `object`                                             | The options for this instantiation of the token builder, derived from<br />[TokenRuleBuilderOpts](03-tokeniser.md#tokenrulebuilderopts) |
> | `opts.error`?        | `true`                                               | -                                                                                                                                       |
> | `opts.next`?         | [`TokeniserStates`](03-tokeniser.md#tokeniserstates) | -                                                                                                                                       |
> | `opts.push`?         | [`TokeniserStates`](03-tokeniser.md#tokeniserstates) | -                                                                                                                                       |
> | `opts.state`         | [`TokeniserStates`](03-tokeniser.md#tokeniserstates) | -                                                                                                                                       |
> | `opts.tokeniserOpts` | [`TokeniserOpts`](03-tokeniser.md#tokeniseropts)     | -                                                                                                                                       |
>
> ###### Returns
>
> > > (`__namedParameters`): `Rule`
> >
> > ###### Parameters
> >
> > | Parameter                         | Type                                                 |
> > | :-------------------------------- | :--------------------------------------------------- |
> > | `__namedParameters`               | `object`                                             |
> > | `__namedParameters.error`?        | `true`                                               |
> > | `__namedParameters.next`?         | [`TokeniserStates`](03-tokeniser.md#tokeniserstates) |
> > | `__namedParameters.push`?         | [`TokeniserStates`](03-tokeniser.md#tokeniserstates) |
> > | `__namedParameters.state`         | [`TokeniserStates`](03-tokeniser.md#tokeniserstates) |
> > | `__namedParameters.tokeniserOpts` | [`TokeniserOpts`](03-tokeniser.md#tokeniseropts)     |
> >
> > ###### Returns
> >
> > `Rule`
> >
> > ###### Source
> >
> > [src/tokeniser/lexer.ts:288](https://github.com/adamscybot/tc-message-toolkit/blob/4e7c9a6/src/tokeniser/lexer.ts#L288)
>
> ###### overrideTokenDefs.lineTermination
>
> `optional` `readonly` **lineTermination**: (`baseImpl`, `opts`) => (`__namedParameters`) => `Rule`
>
> ###### Parameters
>
> | Parameter            | Type                                                 | Description                                                                                                                             |
> | :------------------- | :--------------------------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------- |
> | `baseImpl`           | (`opts`) => `Rule`                                   | The original implementation for this token builder                                                                                      |
> | `opts`               | `object`                                             | The options for this instantiation of the token builder, derived from<br />[TokenRuleBuilderOpts](03-tokeniser.md#tokenrulebuilderopts) |
> | `opts.error`?        | `true`                                               | -                                                                                                                                       |
> | `opts.next`?         | [`TokeniserStates`](03-tokeniser.md#tokeniserstates) | -                                                                                                                                       |
> | `opts.push`?         | [`TokeniserStates`](03-tokeniser.md#tokeniserstates) | -                                                                                                                                       |
> | `opts.state`         | [`TokeniserStates`](03-tokeniser.md#tokeniserstates) | -                                                                                                                                       |
> | `opts.tokeniserOpts` | [`TokeniserOpts`](03-tokeniser.md#tokeniseropts)     | -                                                                                                                                       |
>
> ###### Returns
>
> > > (`__namedParameters`): `Rule`
> >
> > ###### Parameters
> >
> > | Parameter                         | Type                                                 |
> > | :-------------------------------- | :--------------------------------------------------- |
> > | `__namedParameters`               | `object`                                             |
> > | `__namedParameters.error`?        | `true`                                               |
> > | `__namedParameters.next`?         | [`TokeniserStates`](03-tokeniser.md#tokeniserstates) |
> > | `__namedParameters.push`?         | [`TokeniserStates`](03-tokeniser.md#tokeniserstates) |
> > | `__namedParameters.state`         | [`TokeniserStates`](03-tokeniser.md#tokeniserstates) |
> > | `__namedParameters.tokeniserOpts` | [`TokeniserOpts`](03-tokeniser.md#tokeniseropts)     |
> >
> > ###### Returns
> >
> > `Rule`
> >
> > ###### Source
> >
> > [src/tokeniser/lexer.ts:278](https://github.com/adamscybot/tc-message-toolkit/blob/4e7c9a6/src/tokeniser/lexer.ts#L278)
>
> ###### overrideTokenDefs.messageName
>
> `optional` `readonly` **messageName**: (`baseImpl`, `opts`) => (`__namedParameters`) => `Rule`
>
> ###### Parameters
>
> | Parameter            | Type                                                 | Description                                                                                                                             |
> | :------------------- | :--------------------------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------- |
> | `baseImpl`           | (`opts`) => `Rule`                                   | The original implementation for this token builder                                                                                      |
> | `opts`               | `object`                                             | The options for this instantiation of the token builder, derived from<br />[TokenRuleBuilderOpts](03-tokeniser.md#tokenrulebuilderopts) |
> | `opts.error`?        | `true`                                               | -                                                                                                                                       |
> | `opts.next`?         | [`TokeniserStates`](03-tokeniser.md#tokeniserstates) | -                                                                                                                                       |
> | `opts.push`?         | [`TokeniserStates`](03-tokeniser.md#tokeniserstates) | -                                                                                                                                       |
> | `opts.state`         | [`TokeniserStates`](03-tokeniser.md#tokeniserstates) | -                                                                                                                                       |
> | `opts.tokeniserOpts` | [`TokeniserOpts`](03-tokeniser.md#tokeniseropts)     | -                                                                                                                                       |
>
> ###### Returns
>
> > > (`__namedParameters`): `Rule`
> >
> > ###### Parameters
> >
> > | Parameter                         | Type                                                 |
> > | :-------------------------------- | :--------------------------------------------------- |
> > | `__namedParameters`               | `object`                                             |
> > | `__namedParameters.error`?        | `true`                                               |
> > | `__namedParameters.next`?         | [`TokeniserStates`](03-tokeniser.md#tokeniserstates) |
> > | `__namedParameters.push`?         | [`TokeniserStates`](03-tokeniser.md#tokeniserstates) |
> > | `__namedParameters.state`         | [`TokeniserStates`](03-tokeniser.md#tokeniserstates) |
> > | `__namedParameters.tokeniserOpts` | [`TokeniserOpts`](03-tokeniser.md#tokeniseropts)     |
> >
> > ###### Returns
> >
> > `Rule`
> >
> > ###### Source
> >
> > [src/tokeniser/lexer.ts:304](https://github.com/adamscybot/tc-message-toolkit/blob/4e7c9a6/src/tokeniser/lexer.ts#L304)
>
> ###### overrideTokenDefs.nonServiceMessageOutput
>
> `optional` `readonly` **nonServiceMessageOutput**: (`baseImpl`, `opts`) => (`__namedParameters`) => `Rule`
>
> ###### Parameters
>
> | Parameter            | Type                                                 | Description                                                                                                                             |
> | :------------------- | :--------------------------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------- |
> | `baseImpl`           | (`opts`) => `Rule`                                   | The original implementation for this token builder                                                                                      |
> | `opts`               | `object`                                             | The options for this instantiation of the token builder, derived from<br />[TokenRuleBuilderOpts](03-tokeniser.md#tokenrulebuilderopts) |
> | `opts.error`?        | `true`                                               | -                                                                                                                                       |
> | `opts.next`?         | [`TokeniserStates`](03-tokeniser.md#tokeniserstates) | -                                                                                                                                       |
> | `opts.push`?         | [`TokeniserStates`](03-tokeniser.md#tokeniserstates) | -                                                                                                                                       |
> | `opts.state`         | [`TokeniserStates`](03-tokeniser.md#tokeniserstates) | -                                                                                                                                       |
> | `opts.tokeniserOpts` | [`TokeniserOpts`](03-tokeniser.md#tokeniseropts)     | -                                                                                                                                       |
>
> ###### Returns
>
> > > (`__namedParameters`): `Rule`
> >
> > ###### Parameters
> >
> > | Parameter                         | Type                                                 |
> > | :-------------------------------- | :--------------------------------------------------- |
> > | `__namedParameters`               | `object`                                             |
> > | `__namedParameters.error`?        | `true`                                               |
> > | `__namedParameters.next`?         | [`TokeniserStates`](03-tokeniser.md#tokeniserstates) |
> > | `__namedParameters.push`?         | [`TokeniserStates`](03-tokeniser.md#tokeniserstates) |
> > | `__namedParameters.state`         | [`TokeniserStates`](03-tokeniser.md#tokeniserstates) |
> > | `__namedParameters.tokeniserOpts` | [`TokeniserOpts`](03-tokeniser.md#tokeniseropts)     |
> >
> > ###### Returns
> >
> > `Rule`
> >
> > ###### Source
> >
> > [src/tokeniser/lexer.ts:175](https://github.com/adamscybot/tc-message-toolkit/blob/4e7c9a6/src/tokeniser/lexer.ts#L175)
>
> ###### overrideTokenDefs.parametersClose
>
> `optional` `readonly` **parametersClose**: (`baseImpl`, `opts`) => (`__namedParameters`) => `Rule`
>
> ###### Parameters
>
> | Parameter            | Type                                                 | Description                                                                                                                             |
> | :------------------- | :--------------------------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------- |
> | `baseImpl`           | (`opts`) => `Rule`                                   | The original implementation for this token builder                                                                                      |
> | `opts`               | `object`                                             | The options for this instantiation of the token builder, derived from<br />[TokenRuleBuilderOpts](03-tokeniser.md#tokenrulebuilderopts) |
> | `opts.error`?        | `true`                                               | -                                                                                                                                       |
> | `opts.next`?         | [`TokeniserStates`](03-tokeniser.md#tokeniserstates) | -                                                                                                                                       |
> | `opts.push`?         | [`TokeniserStates`](03-tokeniser.md#tokeniserstates) | -                                                                                                                                       |
> | `opts.state`         | [`TokeniserStates`](03-tokeniser.md#tokeniserstates) | -                                                                                                                                       |
> | `opts.tokeniserOpts` | [`TokeniserOpts`](03-tokeniser.md#tokeniseropts)     | -                                                                                                                                       |
>
> ###### Returns
>
> > > (`__namedParameters`): `Rule`
> >
> > ###### Parameters
> >
> > | Parameter                         | Type                                                 |
> > | :-------------------------------- | :--------------------------------------------------- |
> > | `__namedParameters`               | `object`                                             |
> > | `__namedParameters.error`?        | `true`                                               |
> > | `__namedParameters.next`?         | [`TokeniserStates`](03-tokeniser.md#tokeniserstates) |
> > | `__namedParameters.push`?         | [`TokeniserStates`](03-tokeniser.md#tokeniserstates) |
> > | `__namedParameters.state`         | [`TokeniserStates`](03-tokeniser.md#tokeniserstates) |
> > | `__namedParameters.tokeniserOpts` | [`TokeniserOpts`](03-tokeniser.md#tokeniseropts)     |
> >
> > ###### Returns
> >
> > `Rule`
> >
> > ###### Source
> >
> > [src/tokeniser/lexer.ts:194](https://github.com/adamscybot/tc-message-toolkit/blob/4e7c9a6/src/tokeniser/lexer.ts#L194)
>
> ###### overrideTokenDefs.parametersOpen
>
> `optional` `readonly` **parametersOpen**: (`baseImpl`, `opts`) => (`__namedParameters`) => `Rule`
>
> ###### Parameters
>
> | Parameter            | Type                                                 | Description                                                                                                                             |
> | :------------------- | :--------------------------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------- |
> | `baseImpl`           | (`opts`) => `Rule`                                   | The original implementation for this token builder                                                                                      |
> | `opts`               | `object`                                             | The options for this instantiation of the token builder, derived from<br />[TokenRuleBuilderOpts](03-tokeniser.md#tokenrulebuilderopts) |
> | `opts.error`?        | `true`                                               | -                                                                                                                                       |
> | `opts.next`?         | [`TokeniserStates`](03-tokeniser.md#tokeniserstates) | -                                                                                                                                       |
> | `opts.push`?         | [`TokeniserStates`](03-tokeniser.md#tokeniserstates) | -                                                                                                                                       |
> | `opts.state`         | [`TokeniserStates`](03-tokeniser.md#tokeniserstates) | -                                                                                                                                       |
> | `opts.tokeniserOpts` | [`TokeniserOpts`](03-tokeniser.md#tokeniseropts)     | -                                                                                                                                       |
>
> ###### Returns
>
> > > (`__namedParameters`): `Rule`
> >
> > ###### Parameters
> >
> > | Parameter                         | Type                                                 |
> > | :-------------------------------- | :--------------------------------------------------- |
> > | `__namedParameters`               | `object`                                             |
> > | `__namedParameters.error`?        | `true`                                               |
> > | `__namedParameters.next`?         | [`TokeniserStates`](03-tokeniser.md#tokeniserstates) |
> > | `__namedParameters.push`?         | [`TokeniserStates`](03-tokeniser.md#tokeniserstates) |
> > | `__namedParameters.state`         | [`TokeniserStates`](03-tokeniser.md#tokeniserstates) |
> > | `__namedParameters.tokeniserOpts` | [`TokeniserOpts`](03-tokeniser.md#tokeniseropts)     |
> >
> > ###### Returns
> >
> > `Rule`
> >
> > ###### Source
> >
> > [src/tokeniser/lexer.ts:185](https://github.com/adamscybot/tc-message-toolkit/blob/4e7c9a6/src/tokeniser/lexer.ts#L185)
>
> ###### overrideTokenDefs.propertyAssignOperator
>
> `optional` `readonly` **propertyAssignOperator**: (`baseImpl`, `opts`) => (`__namedParameters`) => `Rule`
>
> ###### Parameters
>
> | Parameter            | Type                                                 | Description                                                                                                                             |
> | :------------------- | :--------------------------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------- |
> | `baseImpl`           | (`opts`) => `Rule`                                   | The original implementation for this token builder                                                                                      |
> | `opts`               | `object`                                             | The options for this instantiation of the token builder, derived from<br />[TokenRuleBuilderOpts](03-tokeniser.md#tokenrulebuilderopts) |
> | `opts.error`?        | `true`                                               | -                                                                                                                                       |
> | `opts.next`?         | [`TokeniserStates`](03-tokeniser.md#tokeniserstates) | -                                                                                                                                       |
> | `opts.push`?         | [`TokeniserStates`](03-tokeniser.md#tokeniserstates) | -                                                                                                                                       |
> | `opts.state`         | [`TokeniserStates`](03-tokeniser.md#tokeniserstates) | -                                                                                                                                       |
> | `opts.tokeniserOpts` | [`TokeniserOpts`](03-tokeniser.md#tokeniseropts)     | -                                                                                                                                       |
>
> ###### Returns
>
> > > (`__namedParameters`): `Rule`
> >
> > ###### Parameters
> >
> > | Parameter                         | Type                                                 |
> > | :-------------------------------- | :--------------------------------------------------- |
> > | `__namedParameters`               | `object`                                             |
> > | `__namedParameters.error`?        | `true`                                               |
> > | `__namedParameters.next`?         | [`TokeniserStates`](03-tokeniser.md#tokeniserstates) |
> > | `__namedParameters.push`?         | [`TokeniserStates`](03-tokeniser.md#tokeniserstates) |
> > | `__namedParameters.state`         | [`TokeniserStates`](03-tokeniser.md#tokeniserstates) |
> > | `__namedParameters.tokeniserOpts` | [`TokeniserOpts`](03-tokeniser.md#tokeniseropts)     |
> >
> > ###### Returns
> >
> > `Rule`
> >
> > ###### Source
> >
> > [src/tokeniser/lexer.ts:314](https://github.com/adamscybot/tc-message-toolkit/blob/4e7c9a6/src/tokeniser/lexer.ts#L314)
>
> ###### overrideTokenDefs.propertyName
>
> `optional` `readonly` **propertyName**: (`baseImpl`, `opts`) => (`__namedParameters`) => `Rule`
>
> ###### Parameters
>
> | Parameter            | Type                                                 | Description                                                                                                                             |
> | :------------------- | :--------------------------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------- |
> | `baseImpl`           | (`opts`) => `Rule`                                   | The original implementation for this token builder                                                                                      |
> | `opts`               | `object`                                             | The options for this instantiation of the token builder, derived from<br />[TokenRuleBuilderOpts](03-tokeniser.md#tokenrulebuilderopts) |
> | `opts.error`?        | `true`                                               | -                                                                                                                                       |
> | `opts.next`?         | [`TokeniserStates`](03-tokeniser.md#tokeniserstates) | -                                                                                                                                       |
> | `opts.push`?         | [`TokeniserStates`](03-tokeniser.md#tokeniserstates) | -                                                                                                                                       |
> | `opts.state`         | [`TokeniserStates`](03-tokeniser.md#tokeniserstates) | -                                                                                                                                       |
> | `opts.tokeniserOpts` | [`TokeniserOpts`](03-tokeniser.md#tokeniseropts)     | -                                                                                                                                       |
>
> ###### Returns
>
> > > (`__namedParameters`): `Rule`
> >
> > ###### Parameters
> >
> > | Parameter                         | Type                                                 |
> > | :-------------------------------- | :--------------------------------------------------- |
> > | `__namedParameters`               | `object`                                             |
> > | `__namedParameters.error`?        | `true`                                               |
> > | `__namedParameters.next`?         | [`TokeniserStates`](03-tokeniser.md#tokeniserstates) |
> > | `__namedParameters.push`?         | [`TokeniserStates`](03-tokeniser.md#tokeniserstates) |
> > | `__namedParameters.state`         | [`TokeniserStates`](03-tokeniser.md#tokeniserstates) |
> > | `__namedParameters.tokeniserOpts` | [`TokeniserOpts`](03-tokeniser.md#tokeniseropts)     |
> >
> > ###### Returns
> >
> > `Rule`
> >
> > ###### Source
> >
> > [src/tokeniser/lexer.ts:295](https://github.com/adamscybot/tc-message-toolkit/blob/4e7c9a6/src/tokeniser/lexer.ts#L295)
>
> ###### overrideTokenDefs.serviceMessageIdent
>
> `optional` `readonly` **serviceMessageIdent**: (`baseImpl`, `opts`) => (`__namedParameters`) => `Rule`
>
> ###### Parameters
>
> | Parameter            | Type                                                 | Description                                                                                                                             |
> | :------------------- | :--------------------------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------- |
> | `baseImpl`           | (`opts`) => `Rule`                                   | The original implementation for this token builder                                                                                      |
> | `opts`               | `object`                                             | The options for this instantiation of the token builder, derived from<br />[TokenRuleBuilderOpts](03-tokeniser.md#tokenrulebuilderopts) |
> | `opts.error`?        | `true`                                               | -                                                                                                                                       |
> | `opts.next`?         | [`TokeniserStates`](03-tokeniser.md#tokeniserstates) | -                                                                                                                                       |
> | `opts.push`?         | [`TokeniserStates`](03-tokeniser.md#tokeniserstates) | -                                                                                                                                       |
> | `opts.state`         | [`TokeniserStates`](03-tokeniser.md#tokeniserstates) | -                                                                                                                                       |
> | `opts.tokeniserOpts` | [`TokeniserOpts`](03-tokeniser.md#tokeniseropts)     | -                                                                                                                                       |
>
> ###### Returns
>
> > > (`__namedParameters`): `Rule`
> >
> > ###### Parameters
> >
> > | Parameter                         | Type                                                 |
> > | :-------------------------------- | :--------------------------------------------------- |
> > | `__namedParameters`               | `object`                                             |
> > | `__namedParameters.error`?        | `true`                                               |
> > | `__namedParameters.next`?         | [`TokeniserStates`](03-tokeniser.md#tokeniserstates) |
> > | `__namedParameters.push`?         | [`TokeniserStates`](03-tokeniser.md#tokeniserstates) |
> > | `__namedParameters.state`         | [`TokeniserStates`](03-tokeniser.md#tokeniserstates) |
> > | `__namedParameters.tokeniserOpts` | [`TokeniserOpts`](03-tokeniser.md#tokeniseropts)     |
> >
> > ###### Returns
> >
> > `Rule`
> >
> > ###### Source
> >
> > [src/tokeniser/lexer.ts:166](https://github.com/adamscybot/tc-message-toolkit/blob/4e7c9a6/src/tokeniser/lexer.ts#L166)
>
> ###### overrideTokenDefs.space
>
> `optional` `readonly` **space**: (`baseImpl`, `opts`) => (`__namedParameters`) => `Rule`
>
> ###### Parameters
>
> | Parameter  | Type                                                                                         | Description                                                                                                                             |
> | :--------- | :------------------------------------------------------------------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------- |
> | `baseImpl` | (`opts`) => `Rule`                                                                           | The original implementation for this token builder                                                                                      |
> | `opts`     | [`TokenRuleBuilderOpts`](03-tokeniser.md#tokenrulebuilderopts)< \{`lookahead`: `string`;} \> | The options for this instantiation of the token builder, derived from<br />[TokenRuleBuilderOpts](03-tokeniser.md#tokenrulebuilderopts) |
>
> ###### Returns
>
> > > (`__namedParameters`): `Rule`
> >
> > ###### Parameters
> >
> > | Parameter           | Type                                                                                         |
> > | :------------------ | :------------------------------------------------------------------------------------------- |
> > | `__namedParameters` | [`TokenRuleBuilderOpts`](03-tokeniser.md#tokenrulebuilderopts)< \{`lookahead`: `string`;} \> |
> >
> > ###### Returns
> >
> > `Rule`
> >
> > ###### Source
> >
> > [src/tokeniser/lexer.ts:262](https://github.com/adamscybot/tc-message-toolkit/blob/4e7c9a6/src/tokeniser/lexer.ts#L262)
>
> ###### overrideTokenDefs.stringEnd
>
> `optional` `readonly` **stringEnd**: (`baseImpl`, `opts`) => (`__namedParameters`) => `Rule`
>
> ###### Parameters
>
> | Parameter            | Type                                                 | Description                                                                                                                             |
> | :------------------- | :--------------------------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------- |
> | `baseImpl`           | (`opts`) => `Rule`                                   | The original implementation for this token builder                                                                                      |
> | `opts`               | `object`                                             | The options for this instantiation of the token builder, derived from<br />[TokenRuleBuilderOpts](03-tokeniser.md#tokenrulebuilderopts) |
> | `opts.error`?        | `true`                                               | -                                                                                                                                       |
> | `opts.next`?         | [`TokeniserStates`](03-tokeniser.md#tokeniserstates) | -                                                                                                                                       |
> | `opts.push`?         | [`TokeniserStates`](03-tokeniser.md#tokeniserstates) | -                                                                                                                                       |
> | `opts.state`         | [`TokeniserStates`](03-tokeniser.md#tokeniserstates) | -                                                                                                                                       |
> | `opts.tokeniserOpts` | [`TokeniserOpts`](03-tokeniser.md#tokeniseropts)     | -                                                                                                                                       |
>
> ###### Returns
>
> > > (`__namedParameters`): `Rule`
> >
> > ###### Parameters
> >
> > | Parameter                         | Type                                                 |
> > | :-------------------------------- | :--------------------------------------------------- |
> > | `__namedParameters`               | `object`                                             |
> > | `__namedParameters.error`?        | `true`                                               |
> > | `__namedParameters.next`?         | [`TokeniserStates`](03-tokeniser.md#tokeniserstates) |
> > | `__namedParameters.push`?         | [`TokeniserStates`](03-tokeniser.md#tokeniserstates) |
> > | `__namedParameters.state`         | [`TokeniserStates`](03-tokeniser.md#tokeniserstates) |
> > | `__namedParameters.tokeniserOpts` | [`TokeniserOpts`](03-tokeniser.md#tokeniseropts)     |
> >
> > ###### Returns
> >
> > `Rule`
> >
> > ###### Source
> >
> > [src/tokeniser/lexer.ts:212](https://github.com/adamscybot/tc-message-toolkit/blob/4e7c9a6/src/tokeniser/lexer.ts#L212)
>
> ###### overrideTokenDefs.stringEscapeSingleChar
>
> `optional` `readonly` **stringEscapeSingleChar**: (`baseImpl`, `opts`) => (`__namedParameters`) => `Rule`
>
> ###### Parameters
>
> | Parameter            | Type                                                 | Description                                                                                                                             |
> | :------------------- | :--------------------------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------- |
> | `baseImpl`           | (`opts`) => `Rule`                                   | The original implementation for this token builder                                                                                      |
> | `opts`               | `object`                                             | The options for this instantiation of the token builder, derived from<br />[TokenRuleBuilderOpts](03-tokeniser.md#tokenrulebuilderopts) |
> | `opts.error`?        | `true`                                               | -                                                                                                                                       |
> | `opts.next`?         | [`TokeniserStates`](03-tokeniser.md#tokeniserstates) | -                                                                                                                                       |
> | `opts.push`?         | [`TokeniserStates`](03-tokeniser.md#tokeniserstates) | -                                                                                                                                       |
> | `opts.state`         | [`TokeniserStates`](03-tokeniser.md#tokeniserstates) | -                                                                                                                                       |
> | `opts.tokeniserOpts` | [`TokeniserOpts`](03-tokeniser.md#tokeniseropts)     | -                                                                                                                                       |
>
> ###### Returns
>
> > > (`__namedParameters`): `Rule`
> >
> > ###### Parameters
> >
> > | Parameter                         | Type                                                 |
> > | :-------------------------------- | :--------------------------------------------------- |
> > | `__namedParameters`               | `object`                                             |
> > | `__namedParameters.error`?        | `true`                                               |
> > | `__namedParameters.next`?         | [`TokeniserStates`](03-tokeniser.md#tokeniserstates) |
> > | `__namedParameters.push`?         | [`TokeniserStates`](03-tokeniser.md#tokeniserstates) |
> > | `__namedParameters.state`         | [`TokeniserStates`](03-tokeniser.md#tokeniserstates) |
> > | `__namedParameters.tokeniserOpts` | [`TokeniserOpts`](03-tokeniser.md#tokeniseropts)     |
> >
> > ###### Returns
> >
> > `Rule`
> >
> > ###### Source
> >
> > [src/tokeniser/lexer.ts:220](https://github.com/adamscybot/tc-message-toolkit/blob/4e7c9a6/src/tokeniser/lexer.ts#L220)
>
> ###### overrideTokenDefs.stringEscapeUnicode
>
> `optional` `readonly` **stringEscapeUnicode**: (`baseImpl`, `opts`) => (`__namedParameters`) => `Rule`
>
> ###### Parameters
>
> | Parameter            | Type                                                 | Description                                                                                                                             |
> | :------------------- | :--------------------------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------- |
> | `baseImpl`           | (`opts`) => `Rule`                                   | The original implementation for this token builder                                                                                      |
> | `opts`               | `object`                                             | The options for this instantiation of the token builder, derived from<br />[TokenRuleBuilderOpts](03-tokeniser.md#tokenrulebuilderopts) |
> | `opts.error`?        | `true`                                               | -                                                                                                                                       |
> | `opts.next`?         | [`TokeniserStates`](03-tokeniser.md#tokeniserstates) | -                                                                                                                                       |
> | `opts.push`?         | [`TokeniserStates`](03-tokeniser.md#tokeniserstates) | -                                                                                                                                       |
> | `opts.state`         | [`TokeniserStates`](03-tokeniser.md#tokeniserstates) | -                                                                                                                                       |
> | `opts.tokeniserOpts` | [`TokeniserOpts`](03-tokeniser.md#tokeniseropts)     | -                                                                                                                                       |
>
> ###### Returns
>
> > > (`__namedParameters`): `Rule`
> >
> > ###### Parameters
> >
> > | Parameter                         | Type                                                 |
> > | :-------------------------------- | :--------------------------------------------------- |
> > | `__namedParameters`               | `object`                                             |
> > | `__namedParameters.error`?        | `true`                                               |
> > | `__namedParameters.next`?         | [`TokeniserStates`](03-tokeniser.md#tokeniserstates) |
> > | `__namedParameters.push`?         | [`TokeniserStates`](03-tokeniser.md#tokeniserstates) |
> > | `__namedParameters.state`         | [`TokeniserStates`](03-tokeniser.md#tokeniserstates) |
> > | `__namedParameters.tokeniserOpts` | [`TokeniserOpts`](03-tokeniser.md#tokeniseropts)     |
> >
> > ###### Returns
> >
> > `Rule`
> >
> > ###### Source
> >
> > [src/tokeniser/lexer.ts:236](https://github.com/adamscybot/tc-message-toolkit/blob/4e7c9a6/src/tokeniser/lexer.ts#L236)
>
> ###### overrideTokenDefs.stringStart
>
> `optional` `readonly` **stringStart**: (`baseImpl`, `opts`) => (`__namedParameters`) => `Rule`
>
> ###### Parameters
>
> | Parameter            | Type                                                 | Description                                                                                                                             |
> | :------------------- | :--------------------------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------- |
> | `baseImpl`           | (`opts`) => `Rule`                                   | The original implementation for this token builder                                                                                      |
> | `opts`               | `object`                                             | The options for this instantiation of the token builder, derived from<br />[TokenRuleBuilderOpts](03-tokeniser.md#tokenrulebuilderopts) |
> | `opts.error`?        | `true`                                               | -                                                                                                                                       |
> | `opts.next`?         | [`TokeniserStates`](03-tokeniser.md#tokeniserstates) | -                                                                                                                                       |
> | `opts.push`?         | [`TokeniserStates`](03-tokeniser.md#tokeniserstates) | -                                                                                                                                       |
> | `opts.state`         | [`TokeniserStates`](03-tokeniser.md#tokeniserstates) | -                                                                                                                                       |
> | `opts.tokeniserOpts` | [`TokeniserOpts`](03-tokeniser.md#tokeniseropts)     | -                                                                                                                                       |
>
> ###### Returns
>
> > > (`__namedParameters`): `Rule`
> >
> > ###### Parameters
> >
> > | Parameter                         | Type                                                 |
> > | :-------------------------------- | :--------------------------------------------------- |
> > | `__namedParameters`               | `object`                                             |
> > | `__namedParameters.error`?        | `true`                                               |
> > | `__namedParameters.next`?         | [`TokeniserStates`](03-tokeniser.md#tokeniserstates) |
> > | `__namedParameters.push`?         | [`TokeniserStates`](03-tokeniser.md#tokeniserstates) |
> > | `__namedParameters.state`         | [`TokeniserStates`](03-tokeniser.md#tokeniserstates) |
> > | `__namedParameters.tokeniserOpts` | [`TokeniserOpts`](03-tokeniser.md#tokeniseropts)     |
> >
> > ###### Returns
> >
> > `Rule`
> >
> > ###### Source
> >
> > [src/tokeniser/lexer.ts:203](https://github.com/adamscybot/tc-message-toolkit/blob/4e7c9a6/src/tokeniser/lexer.ts#L203)
>
> ###### overrideTokenDefs.stringValue
>
> `optional` `readonly` **stringValue**: (`baseImpl`, `opts`) => (`__namedParameters`) => `Rule`
>
> ###### Parameters
>
> | Parameter            | Type                                                 | Description                                                                                                                             |
> | :------------------- | :--------------------------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------- |
> | `baseImpl`           | (`opts`) => `Rule`                                   | The original implementation for this token builder                                                                                      |
> | `opts`               | `object`                                             | The options for this instantiation of the token builder, derived from<br />[TokenRuleBuilderOpts](03-tokeniser.md#tokenrulebuilderopts) |
> | `opts.error`?        | `true`                                               | -                                                                                                                                       |
> | `opts.next`?         | [`TokeniserStates`](03-tokeniser.md#tokeniserstates) | -                                                                                                                                       |
> | `opts.push`?         | [`TokeniserStates`](03-tokeniser.md#tokeniserstates) | -                                                                                                                                       |
> | `opts.state`         | [`TokeniserStates`](03-tokeniser.md#tokeniserstates) | -                                                                                                                                       |
> | `opts.tokeniserOpts` | [`TokeniserOpts`](03-tokeniser.md#tokeniseropts)     | -                                                                                                                                       |
>
> ###### Returns
>
> > > (`__namedParameters`): `Rule`
> >
> > ###### Parameters
> >
> > | Parameter                         | Type                                                 |
> > | :-------------------------------- | :--------------------------------------------------- |
> > | `__namedParameters`               | `object`                                             |
> > | `__namedParameters.error`?        | `true`                                               |
> > | `__namedParameters.next`?         | [`TokeniserStates`](03-tokeniser.md#tokeniserstates) |
> > | `__namedParameters.push`?         | [`TokeniserStates`](03-tokeniser.md#tokeniserstates) |
> > | `__namedParameters.state`         | [`TokeniserStates`](03-tokeniser.md#tokeniserstates) |
> > | `__namedParameters.tokeniserOpts` | [`TokeniserOpts`](03-tokeniser.md#tokeniseropts)     |
> >
> > ###### Returns
> >
> > `Rule`
> >
> > ###### Source
> >
> > [src/tokeniser/lexer.ts:252](https://github.com/adamscybot/tc-message-toolkit/blob/4e7c9a6/src/tokeniser/lexer.ts#L252)

###### Source

[src/tokeniser/lexer.ts:388](https://github.com/adamscybot/tc-message-toolkit/blob/4e7c9a6/src/tokeniser/lexer.ts#L388)

---

##### unsafeLooseParameters

> `optional` **unsafeLooseParameters**: `boolean`

###### Source

[src/tokeniser/lexer.ts:352](https://github.com/adamscybot/tc-message-toolkit/blob/4e7c9a6/src/tokeniser/lexer.ts#L352)

## Type Aliases

### RuleBuilderFn

> **RuleBuilderFn**: (`opts`?) => `Rule`

A function which builds a Rule. It will usually have a base internal
implementation and will compose the provided overrides.

#### Parameters

| Parameter | Type   | Description                                                                                                                                                      |
| :-------- | :----- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `opts`?   | `Rule` | The context from the caller, usually a partial Rule that<br /> represents specific variations needed by the caller. This normally<br /> overrides the base impl. |

#### Returns

`Rule`

The composed Rule that would be used in the original
implementation for this token.

#### Source

[src/tokeniser/lexer.ts:106](https://github.com/adamscybot/tc-message-toolkit/blob/4e7c9a6/src/tokeniser/lexer.ts#L106)

---

### Token

> **Token**: `Omit`< `MooToken`, `"type"` \> & \{`type`: [`SERVICE_MESSAGE_IDENT`](03-tokeniser.md#service_message_ident) \| [`NON_SERVICE_MESSAGE_OUTPUT`](03-tokeniser.md#non_service_message_output) \| [`PARAMETERS_OPEN`](03-tokeniser.md#parameters_open) \| [`PARAMETERS_CLOSE`](03-tokeniser.md#parameters_close) \| [`MESSAGE_NAME`](03-tokeniser.md#message_name) \| [`SPACE`](03-tokeniser.md#space) \| [`PROPERTY_ASSIGN_OPERATOR`](03-tokeniser.md#property_assign_operator) \| [`PROPERTY_NAME`](03-tokeniser.md#property_name) \| [`STRING_START`](03-tokeniser.md#string_start) \| [`STRING_END`](03-tokeniser.md#string_end) \| [`STRING_VALUE`](03-tokeniser.md#string_value) \| [`LINE_TERMINATION`](03-tokeniser.md#line_termination) \| [`ERROR`](03-tokeniser.md#error);} \| `Omit`< `MooToken`, `"type"` \| `"value"` \> & \{`type`: [`STRING_ESCAPE_SINGLE_CHAR`](03-tokeniser.md#string_escape_single_char); `value`: `WrappedLiteralTokenValue`;} \| `Omit`< `MooToken`, `"type"` \| `"value"` \> & \{`type`: [`STRING_ESCAPE_UNICODE`](03-tokeniser.md#string_escape_unicode); `value`: `WrappedLiteralTokenValue`;}

#### Source

[src/tokeniser/lexer.ts:4](https://github.com/adamscybot/tc-message-toolkit/blob/4e7c9a6/src/tokeniser/lexer.ts#L4)

---

### TokenRuleBuilder

> **TokenRuleBuilder**: <`AdditionalOpts`\> (`opts`) => `Rule`

#### Type parameters

| Parameter                                               | Default |
| :------------------------------------------------------ | :------ |
| `AdditionalOpts` _extends_ `Record`< `string`, `any` \> | \{}     |

A function which defines how to build the rules for different tokens specific
to this library.

#### Parameters

| Parameter | Type                                                                                | Description                                                                                                            |
| :-------- | :---------------------------------------------------------------------------------- | :--------------------------------------------------------------------------------------------------------------------- |
| `opts`    | [`TokenRuleBuilderOpts`](03-tokeniser.md#tokenrulebuilderopts)< `AdditionalOpts` \> | The [TokenRuleBuilderOpts](03-tokeniser.md#tokenrulebuilderopts) that represent the configuration<br /> for this rule. |

#### Returns

`Rule`

The composed Rule.

#### Source

[src/tokeniser/lexer.ts:151](https://github.com/adamscybot/tc-message-toolkit/blob/4e7c9a6/src/tokeniser/lexer.ts#L151)

---

### TokenRuleBuilderOpts

> **TokenRuleBuilderOpts**: <`AdditionalOpts`\> \{`error`: `true`; `next`: [`TokeniserStates`](03-tokeniser.md#tokeniserstates); `push`: [`TokeniserStates`](03-tokeniser.md#tokeniserstates); `state`: [`TokeniserStates`](03-tokeniser.md#tokeniserstates); `tokeniserOpts`: [`TokeniserOpts`](03-tokeniser.md#tokeniseropts);} & `AdditionalOpts`

> #### TokenRuleBuilderOpts.error
>
> `optional` **error**: `true`
>
> #### TokenRuleBuilderOpts.next
>
> `optional` **next**: [`TokeniserStates`](03-tokeniser.md#tokeniserstates)
>
> #### TokenRuleBuilderOpts.push
>
> `optional` **push**: [`TokeniserStates`](03-tokeniser.md#tokeniserstates)
>
> #### TokenRuleBuilderOpts.state
>
> **state**: [`TokeniserStates`](03-tokeniser.md#tokeniserstates)
>
> #### TokenRuleBuilderOpts.tokeniserOpts
>
> **tokeniserOpts**: [`TokeniserOpts`](03-tokeniser.md#tokeniseropts)

#### Type parameters

| Parameter                                               | Default |
| :------------------------------------------------------ | :------ |
| `AdditionalOpts` _extends_ `Record`< `string`, `any` \> | \{}     |

#### Source

[src/tokeniser/lexer.ts:133](https://github.com/adamscybot/tc-message-toolkit/blob/4e7c9a6/src/tokeniser/lexer.ts#L133)

---

### TokeniserRuleOverrideFn

> **TokeniserRuleOverrideFn**: (`baseImpl`, `stage`, `opts`?) => `Rule`

#### Parameters

| Parameter  | Type                                                 |
| :--------- | :--------------------------------------------------- |
| `baseImpl` | [`RuleBuilderFn`](03-tokeniser.md#rulebuilderfn)     |
| `stage`    | [`TokeniserStates`](03-tokeniser.md#tokeniserstates) |
| `opts`?    | `Rule`                                               |

#### Returns

`Rule`

#### Source

[src/tokeniser/lexer.ts:108](https://github.com/adamscybot/tc-message-toolkit/blob/4e7c9a6/src/tokeniser/lexer.ts#L108)

## Variables

### default

> `let` **default**: `object`

#### Type declaration

##### stream

**stream**

#### Source

[src/tokeniser/index.ts:8](https://github.com/adamscybot/tc-message-toolkit/blob/4e7c9a6/src/tokeniser/index.ts#L8)

## Functions

### tokeniser()

> **tokeniser**(`__namedParameters` = `{}`): `Lexer`

#### Parameters

| Parameter           | Type                                             |
| :------------------ | :----------------------------------------------- |
| `__namedParameters` | [`TokeniserOpts`](03-tokeniser.md#tokeniseropts) |

#### Returns

`Lexer`

#### Source

[src/tokeniser/lexer.ts:407](https://github.com/adamscybot/tc-message-toolkit/blob/4e7c9a6/src/tokeniser/lexer.ts#L407)

---

Generated using [TypeDoc](https://typedoc.org/) and [typedoc-plugin-markdown](https://www.npmjs.com/package/typedoc-plugin-markdown)
