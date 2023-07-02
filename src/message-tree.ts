// import { Readable } from 'node:stream'
// import messages, {
//   TcTestStarted,
//   TcTestFinished,
//   TcTestStdErr,
//   TcTestStdOut,
//   TcTestIgnored,
//   TcTestFailed,
//   TcTestSuiteFinished,
//   TcTestSuiteStarted,
//   Messages,
// } from './messages/wrappers/OLDdefault-messages.js'
// import { TcBaseMessage } from './messages/wrappers/OLDbase-message-types.js'

// type InstanceTypeTuple<T extends Array<(typeof messages)[number]>> = {
//   [P in keyof T]: InstanceType<T[P]>
// }

// class TcTreeNode<
//   AllowedMessages extends (typeof messages)[number],
//   RequiredMessages extends Array<AllowedMessages> = []
// > {
//   public messages: [
//     ...InstanceTypeTuple<RequiredMessages>,
//     ...Array<InstanceType<AllowedMessages>>
//   ]

//   constructor(requiredMessages: InstanceTypeTuple<RequiredMessages>) {
//     this.messages = requiredMessages as [
//       ...InstanceTypeTuple<RequiredMessages>,
//       ...Array<InstanceType<AllowedMessages>>
//     ]
//   }

//   appendMessage(message: InstanceType<AllowedMessages>) {
//     this.messages.push(message)
//   }

//   public findMessage<
//     MessageName extends RequiredMessages[number]['messageName']
//   >(
//     messageName: MessageName
//   ): InstanceType<
//     Extract<RequiredMessages[number], { messageName: MessageName }>
//   >
//   public findMessage<MessageName extends AllowedMessages['messageName']>(
//     messageName: MessageName
//   ):
//     | InstanceType<Extract<AllowedMessages, { messageName: MessageName }>>
//     | undefined
//   public findMessage<
//     MessageName extends
//       | AllowedMessages['messageName']
//       | RequiredMessages[number]['messageName']
//   >(
//     messageName: MessageName
//   ):
//     | InstanceType<
//         Extract<RequiredMessages[number], { messageName: MessageName }>
//       >
//     | InstanceType<Extract<AllowedMessages, { messageName: MessageName }>>
//     | undefined {
//     return this.messages.find(
//       (message) => message.messageName() === messageName
//     )
//   }
// }

// abstract class TcContainsRawText<
//   AllowedMessages extends (typeof messages)[number],
//   RequiredMessages extends Array<AllowedMessages>
// > extends TcTreeNode<AllowedMessages, RequiredMessages> {
//   protected _stdOut: string = ''
//   protected _stdErr: string = ''

//   appendToStdOut(text: string) {
//     this._stdOut += text
//   }

//   appendToStdErr(text: string) {
//     this._stdErr += text
//   }
// }

// export abstract class TcBaseTest<
//   AllowedMessages extends (typeof messages)[number],
//   RequiredMessages extends Array<AllowedMessages> = []
// > extends TcContainsRawText<
//   | typeof TcTestStarted
//   | typeof TcTestFinished
//   | typeof TcTestStdOut
//   | typeof TcTestStdErr
//   | AllowedMessages,
//   RequiredMessages
// > {
//   protected nameString: string

//   name(name: string) {
//     this.nameString = name
//     return this
//   }
// }

// export abstract class TcDummyTestRunnable<
//   AllowedMessages extends (typeof messages)[number],
//   RequiredMessages extends Array<AllowedMessages> = []
// > extends TcBaseTest<typeof TcTestStarted, [typeof TcTestStarted]> {
//   protected durationString: string | undefined = undefined

//   duration(duration: string) {
//     const test = this.messages.find(
//       (message) => message instanceof TcTestStarted
//     )
//     this.durationString = duration
//     const test = this.messages
//     return this
//   }
// }

// export class TcDummyTestIgnored extends TcBaseTest<
//   typeof TcTestIgnored,
//   [typeof TcTestIgnored]
// > {
//   protected messageString: string

//   /**
//    * Set the failure message.
//    *
//    * @param message The string containing the high level failure message
//    */
//   message(message: string) {
//     this.messageString = message
//     return this
//   }

//   /**
//    * TC allows log output for ignored tests to be bookended by start/finish markers or to be standalone.
//    * Setting this to true adds the bookending. Useful for testing different parsing scenarios.
//    **/
//   wrap(shouldWrap: boolean = true) {
//     this.wrapped = shouldWrap
//     return this
//   }
// }

// export class TcDummyTestSucceeds extends TcDummyTestRunnable<never, never> {}

// export class TcDummyTestFails extends TcDummyTestRunnable<
//   typeof TcTestFailed,
//   [typeof TcTestFailed]
// > {
//   private messageString: string | null = null
//   private detailsString: string | null = null

//   /**
//    * Set the failure message.
//    *
//    * @param message The string containing the high level failure message
//    */
//   message(message: string) {
//     this.messageString = message
//     return this
//   }

//   /**
//    * Set the details message, usually used for stack traces relating to the error.
//    *
//    * @param message The string containing the additional error details
//    */
//   details(details: string) {
//     this.detailsString = details
//     return this
//   }
// }

// export class TcDummyTestAccessor {
//   protected stream: Readable

//   constructor(stream: Readable) {
//     this.stream = stream
//   }

//   /**
//    * Define the test as one which will been ignored.
//    *
//    * @returns a test configuration object for further customisation.
//    */
//   ignored() {
//     return new TcDummyTestIgnored()
//   }

//   /**
//    * Define the test as one which will succeed.
//    *
//    * @returns a test configuration object for further customisation.
//    */
//   succeeds() {
//     return new TcDummyTestSucceeds()
//   }

//   /**
//    * Define the test as one which will fail.
//    *
//    * @returns a test configuration object for further customisation.
//    */
//   fails() {
//     return new TcDummyTestFails()
//   }
// }

// export class TcSuiteNode extends TcContainsRawText<
//   typeof TcTestSuiteStarted | typeof TcTestSuiteFinished,
//   [typeof TcTestSuiteStarted]
// > {
//   private childSuites: TcSuiteNode[] = []

//   getChildSuites() {
//     return this.childSuites
//   }

//   addChildSuite(child: TcSuiteNode) {
//     this.childSuites.push(child)
//     return this
//   }

//   getName() {
//     return this.findMessage('testSuiteStarted').getName()
//   }
// }

// // Do flows inherit the parent context? What are the semantics there?
// // I think when a flow is seen for first time, its context is decided at that point.
// // It has to be, otherwis eyou couldnt nest parrallelised tests.
// //aCTUALLY IT seems suite start/stop and test start/stop calls have to be on the same flows
// export class TcMessageFlow {
//   private subFlows: TcMessageFlow[] = []
//   private parent: TcMessageFlow | undefined = undefined
//   // this wont work, we need to persist a tree
//   // I ahve other problems. Like some messages being able to be children of suites and tests.
//   // but mayube thats not really a problem as i can just have them as members where they make sense only
//   // but wait. flows aren't supposed to last forever and can be closed. so anything owned here would die.
//   // maybe this should just find the right thing to append to.
//   // what if i passed the tree route into the flow register and then into here?
//   // i probs do need a proper tree structure with pruning thoguh
//   // it would be nice also to be able to see all the messages in a flow. filte rby flowid. but this would be hard to get in the right order, unless i store timestamps
//   // of message arrival.
//   // i think flow should really store the messages as this is supposed ot be lgon lived strucute
//   private contextStack: Array<TcContainsRawText<any, any>> = []

//   constructor(parent?: TcMessageFlow) {
//     this.parent = parent
//   }

//   private peekContext() {
//     if (this.contextStack.length < 1) return undefined
//     return this.contextStack[this.contextStack.length - 1]
//   }

//   private pushContext(unit: TcContainsRawText<any, any>) {
//     this.contextStack.push(unit)
//   }

//   public addSubFlow() {
//     const subFlow = new TcMessageFlow(this)
//     this.subFlows.push(subFlow)
//     return subFlow
//   }

//   private processTestSuiteStarted(message: TcTestSuiteStarted) {
//     const contextHead = this.peekContext()
//     if (!(contextHead instanceof TcSuiteNode) && contextHead !== undefined) {
//       throw new Error(
//         `Attempted to parse message '${message.messageName()}' but the context head is ${typeof contextHead}. Suites can only be started inside other suites or at the top level of a flow.`
//       )
//     }

//     const suite = new TcSuiteNode([message])
//     this.pushContext(suite)
//     return suite
//   }

//   public processMessage(message: InstanceType<Messages>) {
//     if (message instanceof TcTestSuiteStarted) {
//       const suite = new TcSuiteNode([message])
//       this.pushContext(suite)
//       return
//     }

//     if (message instanceof TcTestStarted) {
//       const name = message.getName()
//       if (
//         this.currentLogContext === undefined ||
//         !(this.currentLogContext instanceof TcSuiteNode)
//       ) {
//         console.error(
//           `Message of type '${message.messageName}' received whilst not in the context of a containing suite.`
//         )
//         return
//       }

//       this.currentLogContext.appendMessage(message)
//       return
//     }

//     if (message instanceof TcTestSuiteFinished) {
//       this.currentLogContext = undefined
//       return
//     }

//     console.warn(`Message "${message.messageName}" not currently supported.`)
//   }
// }

// export class TcFlowRegistry {
//   private static rootFlowId = Symbol('rootFlow')
//   private flowMap = new Map<
//     string | typeof TcFlowRegistry.rootFlowId,
//     TcMessageFlow
//   >()
//   private activeFlowId: string | typeof TcFlowRegistry.rootFlowId =
//     TcFlowRegistry.rootFlowId

//   constructor() {
//     const rootFlow = new TcMessageFlow()
//     this.flowMap.set(TcFlowRegistry.rootFlowId, rootFlow)
//   }

//   processMessage(message: InstanceType<Messages>) {
//     const flowId = message.flowId()

//     let flowToPushTo = this.getRootFlow()
//     if (flowId) {
//       const addressedFlow = this.flowMap.get(flowId)
//       if (!addressedFlow) {
//         // Is this where the context is copied?
//         this.flowMap.set(flowId, this.getActiveFlow().addSubFlow())
//       }
//       this.activeFlowId = flowId
//       flowToPushTo = this.getActiveFlow()
//     }

//     flowToPushTo.processMessage(message)

//     return flowToPushTo
//   }

//   getFlow(flowId: string | typeof TcFlowRegistry.rootFlowId) {
//     return this.flowMap.get(flowId)
//   }

//   getRootFlow() {
//     return this.getFlow(TcFlowRegistry.rootFlowId)!
//   }

//   getActiveFlow() {
//     return this.getFlow(this.activeFlowId)!
//   }
// }

// export class TcMessageTree {
//   private suites: TcSuiteNode[] = []
//   private
//   private currentLogContext: Array<TcContainsRawText<any, any>>

//   public findSuiteByName(name: string) {
//     return this.suites.find((suite) => suite.getName() === name)
//   }

//   public getSuites() {
//     return this.suites
//   }
// }

// export default () => new TcMessageTree()
