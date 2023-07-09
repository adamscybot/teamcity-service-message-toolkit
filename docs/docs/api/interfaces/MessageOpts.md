---
id: "MessageOpts"
title: "Interface: MessageOpts"
sidebar_label: "MessageOpts"
sidebar_position: 0
custom_edit_url: null
---

## Properties

### flowId

• `Optional` **flowId**: `string`

The identifier of the "flow" on which this message was outputted. This is
to support parsers in order to understand situations where multiple
parallel executions are outputting to a single stream. Leaving it undefined
equates to the message being in the "root" flow.

**`See`**

[TeamCity Message FlowId](https://www.jetbrains.com/help/teamcity/service-messages.html#Message+FlowId)

#### Defined in

[src/messages/builder.ts:59](https://github.com/adamscybot/teamcity-service-message-toolkit/blob/653e45d/src/messages/builder.ts#L59)
