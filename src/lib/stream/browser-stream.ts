/**
 * Get underlying Browser web stream API.
 *
 * This file is used for the Vite build meant for the browser. This is performed
 * via an alias named `tc-message-toolkit/stream`. `node-streams.ts` is used for
 * the `tsc` build meant for node.
 *
 * This technique avoids conditional `import()` which would cause unecessary
 * asynchronous interface in some areas.
 *
 * @private Use The `tc-message-toolkit/stream` alias.
 * @packageDocumentation
 */

const TransformStream = window.TransformStream
const ReadableStream = window.ReadableStream

export { TransformStream, ReadableStream }
