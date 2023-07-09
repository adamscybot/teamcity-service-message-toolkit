---
id: "MessageTypeOpts"
title: "Interface: MessageTypeOpts<MessageName>"
sidebar_label: "MessageTypeOpts"
sidebar_position: 0
custom_edit_url: null
---

## Type parameters

| Name | Type |
| :------ | :------ |
| `MessageName` | extends `string` = `string` |

## Properties

### messageName

• **messageName**: `MessageName`

The name of the message that is usually found in the first part of the
paramaters block in a service message log line.

**`See`**

[TeamCity Service Message Formats](https://www.jetbrains.com/help/teamcity/service-messages.html#Service+Messages+Formats)

#### Defined in

[src/messages/builder.ts:45](https://github.com/adamscybot/teamcity-service-message-toolkit/blob/653e45d/src/messages/builder.ts#L45)

## Methods

### toServiceMessageString

▸ **toServiceMessageString**(): `string`

#### Returns

`string`

#### Defined in

[src/messages/builder.ts:47](https://github.com/adamscybot/teamcity-service-message-toolkit/blob/653e45d/src/messages/builder.ts#L47)
