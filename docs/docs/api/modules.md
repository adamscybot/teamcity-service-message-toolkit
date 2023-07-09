---
id: "modules"
title: "tc-message-toolkit"
sidebar_label: "Exports"
sidebar_position: 0.5
custom_edit_url: null
---

## Interfaces

- [MessageOpts](interfaces/MessageOpts.md)
- [MessageTypeOpts](interfaces/MessageTypeOpts.md)

## Type Aliases

### MessageTypeBuilder

Ƭ **MessageTypeBuilder**: typeof [`default`](modules.md#default)

#### Defined in

[src/messages/builder.ts:892](https://github.com/adamscybot/teamcity-service-message-toolkit/blob/653e45d/src/messages/builder.ts#L892)

___

### MessageTypeBuilderMultiEndsWithOpts

Ƭ **MessageTypeBuilderMultiEndsWithOpts**<`Schema`, `BlockContextCloseFactory`\>: `Object`

#### Type parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `Schema` | extends `ZodSchema` | The schema of the parent message |
| `BlockContextCloseFactory` | extends `MessageFactory` | The factory that has been configured as the the one that represents the end message type. |

#### Type declaration

| Name | Type | Description |
| :------ | :------ | :------ |
| `blockKey` | `ValidBlockContextKeys`<`Schema`, `BlockContextCloseFactory`\> | The block key should be set to the name of the attribute that is matched against to correctly specify that the block has ended. `undefined` can be used if any message with the closing message type should close the block. The key must exist as an attribute on the schema of both the current message type being defined and the referenced message type. For example, in TC messages "name" is often used. This setting here influences methods the `isEndContextBlockMessage` method on the ContextualMessage interface. If it is set, this will only return `true` if a the result of calls to `getRawAttr(<blockKey>)` on both messages being compared are is equal, for every defined `blockKey`. Note the representational value (after processing by the schema) is not currently used for comparison. **`Remarks`** Comparison via a custom matcher function, or via comparing the post-schema values, may come later. **`Default Value`** `undefined` Which means the message type of the designated end message factory will trigger the block to end, no matter the attributes. |

#### Defined in

[src/messages/builder.ts:501](https://github.com/adamscybot/teamcity-service-message-toolkit/blob/653e45d/src/messages/builder.ts#L501)

___

### MessageTypeBuilderSingleEndsWithOpts

Ƭ **MessageTypeBuilderSingleEndsWithOpts**: `Object`

#### Type declaration

| Name | Type | Description |
| :------ | :------ | :------ |
| `useValueAsBlockKey?` | `boolean` | If set to `true`, the value of the single attribute message is matched against to correctly specify that the block has ended. `false` can be used if any message with the closing message type should close the block. This setting here influences methods the `isEndContextBlockMessage` method on the ContextualMessage interface. If it is set, this will only return `true` if a the result of calls to `getRawValue(<blockKey>)` on both messages being compared are is equal. Note the representational value (after processing by the schema) is not currently used for comparison. **`Remarks`** Comparison via a custom matcher function, or via comparing the post-schema values, may come later. **`Default Value`** `false` |

#### Defined in

[src/messages/builder.ts:531](https://github.com/adamscybot/teamcity-service-message-toolkit/blob/653e45d/src/messages/builder.ts#L531)

___

### MultiAttributeMessageFactoryBuildOpts

Ƭ **MultiAttributeMessageFactoryBuildOpts**<`MessageName`, `Schema`\>: `Omit`<[`MultiAttributeMessageTypeOpts`](modules.md#multiattributemessagetypeopts)<`MessageName`, `Schema`\>, ``"messageName"`` \| ``"blockContextOpts"``\>

#### Type parameters

| Name | Type |
| :------ | :------ |
| `MessageName` | extends `string` |
| `Schema` | extends `Readonly`<`ZodSchema`\> |

#### Defined in

[src/messages/builder.ts:461](https://github.com/adamscybot/teamcity-service-message-toolkit/blob/653e45d/src/messages/builder.ts#L461)

___

### MultiAttributeMessageOpts

Ƭ **MultiAttributeMessageOpts**<`Schema`\>: [`MessageOpts`](interfaces/MessageOpts.md) & { `rawKwargs`: `RawKwargsOfMultiAttrSchema`<`Schema`\>  }

#### Type parameters

| Name | Type |
| :------ | :------ |
| `Schema` | extends `Readonly`<`ZodSchema`\> |

#### Defined in

[src/messages/builder.ts:251](https://github.com/adamscybot/teamcity-service-message-toolkit/blob/653e45d/src/messages/builder.ts#L251)

___

### MultiAttributeMessageTypeOpts

Ƭ **MultiAttributeMessageTypeOpts**<`MessageName`, `Schema`, `BlockContextCloseFactory`, `BlockContextKey`\>: `Omit`<[`MessageTypeOpts`](interfaces/MessageTypeOpts.md)<`MessageName`\>, ``"toServiceMessageString"``\> & { `blockContextOpts?`: { `blockKey?`: `BlockContextKey` ; `closeFactory`: `BlockContextCloseFactory`  } ; `schema`: `Schema`  }

#### Type parameters

| Name | Type |
| :------ | :------ |
| `MessageName` | extends `string` |
| `Schema` | extends `Readonly`<`ZodSchema`\> |
| `BlockContextCloseFactory` | extends `MessageFactory` \| `undefined` = `undefined` |
| `BlockContextKey` | extends `ValidBlockContextKeys`<`Schema`, `BlockContextCloseFactory`\> = `undefined` |

#### Defined in

[src/messages/builder.ts:230](https://github.com/adamscybot/teamcity-service-message-toolkit/blob/653e45d/src/messages/builder.ts#L230)

___

### MultipleAttributeMessageFactory

Ƭ **MultipleAttributeMessageFactory**<`MessageName`, `Schema`, `BlockContextCloseFactory`, `BlockContextKey`\>: `Object`

#### Type parameters

| Name | Type |
| :------ | :------ |
| `MessageName` | extends `string` |
| `Schema` | extends `Readonly`<`ZodSchema`\> |
| `BlockContextCloseFactory` | extends `MessageFactory` \| `undefined` = `undefined` |
| `BlockContextKey` | extends `ValidBlockContextKeys`<`Schema`, `BlockContextCloseFactory`\> = `undefined` |

#### Call signature

▸ (`opts`): `MultiAttributeMessage`<`MessageName`, `Schema`, `BlockContextCloseFactory`, `BlockContextKey`\>

##### Parameters

| Name | Type |
| :------ | :------ |
| `opts` | [`MultiAttributeMessageOpts`](modules.md#multiattributemessageopts)<`Schema`\> |

##### Returns

`MultiAttributeMessage`<`MessageName`, `Schema`, `BlockContextCloseFactory`, `BlockContextKey`\>

#### Type declaration

| Name | Type | Description |
| :------ | :------ | :------ |
| `messageName` | `MessageName` | Statically accessible property that defines for what message name this factory function handles. |
| `schema` | `Schema` | The built schema for this message type |
| `syntaxType` | ``"multiAttr"`` | Identifier that this is a multi attr message. |

#### Defined in

[src/messages/builder.ts:469](https://github.com/adamscybot/teamcity-service-message-toolkit/blob/653e45d/src/messages/builder.ts#L469)

___

### SingleAttributeMessageFactory

Ƭ **SingleAttributeMessageFactory**<`MessageName`, `Schema`, `BlockContextCloseFactory`\>: `Object`

#### Type parameters

| Name | Type |
| :------ | :------ |
| `MessageName` | extends `string` |
| `Schema` | extends `ZodSchema` |
| `BlockContextCloseFactory` | extends `MessageFactory` \| `undefined` = `undefined` |

#### Call signature

▸ (`opts`): `SingleAttributeMessage`<`MessageName`, `Schema`, `BlockContextCloseFactory`\>

##### Parameters

| Name | Type |
| :------ | :------ |
| `opts` | [`SingleAttributeMessageOpts`](modules.md#singleattributemessageopts) |

##### Returns

`SingleAttributeMessage`<`MessageName`, `Schema`, `BlockContextCloseFactory`\>

#### Type declaration

| Name | Type | Description |
| :------ | :------ | :------ |
| `messageName` | `MessageName` | Statically accessible property that defines for what message name this factory function handles. |
| `schema` | `Schema` | The built schema for this message type |
| `syntaxType` | ``"singleAttr"`` | Identifier that this is a single attr message. |

#### Defined in

[src/messages/builder.ts:439](https://github.com/adamscybot/teamcity-service-message-toolkit/blob/653e45d/src/messages/builder.ts#L439)

___

### SingleAttributeMessageOpts

Ƭ **SingleAttributeMessageOpts**: [`MessageOpts`](interfaces/MessageOpts.md) & { `rawValue?`: `string`  }

#### Defined in

[src/messages/builder.ts:89](https://github.com/adamscybot/teamcity-service-message-toolkit/blob/653e45d/src/messages/builder.ts#L89)

___

### SingleAttributeMessageTypeOpts

Ƭ **SingleAttributeMessageTypeOpts**<`MessageName`, `Schema`, `BlockContextCloseFactory`\>: `Omit`<[`MessageTypeOpts`](interfaces/MessageTypeOpts.md)<`MessageName`\>, ``"toServiceMessageString"`` \| ``"toFriendlystring"``\> & { `blockContextOpts?`: { `closeFactory`: `BlockContextCloseFactory`  } & [`MessageTypeBuilderSingleEndsWithOpts`](modules.md#messagetypebuildersingleendswithopts) ; `schema`: `Schema`  }

#### Type parameters

| Name | Type |
| :------ | :------ |
| `MessageName` | extends `string` |
| `Schema` | extends `ZodSchema` |
| `BlockContextCloseFactory` | extends `MessageFactory` \| `undefined` = `undefined` |

#### Defined in

[src/messages/builder.ts:74](https://github.com/adamscybot/teamcity-service-message-toolkit/blob/653e45d/src/messages/builder.ts#L74)

## Variables

### default

• `Const` **default**: `Object`

The message type builder provides strongly typed utilities for constructing a
factory that creates representations of a mesage for a given service message
type. Typically the resulting factory would be passed to a
MessageTypeRepository.

**`Remarks`**

The builder pattern is necessary for an ergonomic API here due to the
inability to do partial inference in TypeScript. By using this pattern, we
utilise the currying workaround which ensures the user does not have to
define inferrable type args manually.

**`Example`**

Create a single attribute message factory

```ts
const messageFactory = builder
  .name('messageTypeTohandle')
  .singleAttribute()
  .build()
```

**`Example`**

Create a single attribute message factory with a custom schema

```ts
const messageFactory = builder
  .name('messageTypeTohandle')
  .singleAttribute()
  .schema((d) => d.optional())
  .build()
```

**`Example`**

Create a single attribute message factory that opens a context.

```ts
const endMessage = builder.name('endMessage').singleAttribute().build()

const startMessage = builder
  .name('startMessage')
  .singleAttribute()
  .endsWith(endMessage, { useValueAsBlockKey: true })
  .build()
```

**`Example`**

Create a multi attribute message factory with a custom schema

```ts
const messageFactory = builder
  .name('messageTypeTohandle')
  .multipleAttribute()
  .schema((s) =>
    s
      .attribute('name')
      .attribute('description', (a) => a.optional())
      .build()
  )
  .build()
```

**`Example`**

Create a multi attribute message factory that opens a context.

```ts
const endMessage = builder
  .name('endMessage')
  .multipleAttribute()
  .schema((s) => s.attribute('name').build())
  .build()

const startMessage = builder
  .name('startMessage')
  .multipleAttribute()
  .schema((s) => s.attribute('name').build())
  .endsWith(endMessage, { blockKey: 'name' })
  .build()
```

**`See`**

MessageTypeRepository for how to easily construct block context pairs
as part of the repository builder flow.

#### Type declaration

| Name | Type |
| :------ | :------ |

#### Defined in

[src/messages/builder.ts:630](https://github.com/adamscybot/teamcity-service-message-toolkit/blob/653e45d/src/messages/builder.ts#L630)

## Functions

### createSingleAttributeMessage

▸ **createSingleAttributeMessage**<`MessageName`, `Schema`, `BlockContextCloseFactory`\>(`«destructured»`): `SingleAttributeMessage`<`MessageName`, `Schema`, `BlockContextCloseFactory`\>

#### Type parameters

| Name | Type |
| :------ | :------ |
| `MessageName` | extends `string` |
| `Schema` | extends `ZodType`<`any`, `ZodTypeDef`, `any`\> |
| `BlockContextCloseFactory` | extends `undefined` \| `MessageFactory` = `undefined` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `«destructured»` | [`MessageOpts`](interfaces/MessageOpts.md) & { `rawValue?`: `string`  } & `Omit`<[`MessageTypeOpts`](interfaces/MessageTypeOpts.md)<`MessageName`\>, ``"toServiceMessageString"`` \| ``"toFriendlystring"``\> & { `blockContextOpts?`: { `closeFactory`: `BlockContextCloseFactory`  } & [`MessageTypeBuilderSingleEndsWithOpts`](modules.md#messagetypebuildersingleendswithopts) ; `schema`: `Schema`  } |

#### Returns

`SingleAttributeMessage`<`MessageName`, `Schema`, `BlockContextCloseFactory`\>

#### Defined in

[src/messages/builder.ts:97](https://github.com/adamscybot/teamcity-service-message-toolkit/blob/653e45d/src/messages/builder.ts#L97)