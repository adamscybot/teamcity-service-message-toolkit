import messages from '../wrappers/default-messages.js'
import { MessageMapFromStaticType } from '../types.js'
import { TcBaseMessageInterface } from '../types.js'

export class MessageRepository<
  M extends Record<string, { new (...args: any[]): TcBaseMessageInterface }>
> {
  private messageTypes: Partial<M> = {}

  addMessageType<K extends keyof M>(messageName: K, messageClass: M[K]) {
    this.messageTypes[messageName] = messageClass
  }

  removeMessageType<K extends keyof M>(messageName: K) {
    delete this.messageTypes[messageName]
  }

  getMessageType<K extends keyof M>(messageName: K): M[K] | undefined {
    return this.messageTypes[messageName]
  }
}

/**
 * A type that maps the messageName of all official TC events to their respective class representation.
 */
export type DefaultMessageMap = MessageMapFromStaticType<
  (typeof messages)[number]
>

/**
 * A {@link MessageRepository}
 */
class DefaultMessageRepository extends MessageRepository<MessageMap> {
  constructor() {
    super()

    this.addMessageType(TcBuildNumberMessage.messageName, TcBuildNumberMessage)
    this.addMessageType(TcPublishArtifacts.messageName, TcPublishArtifacts)
    this.addMessageType(TcProgressMessage.messageName, TcProgressMessage)
    // ... Add the rest of your message types here ...
  }
}

const defaultMessageRepository = new DefaultMessageRepository()
export default defaultMessageRepository
