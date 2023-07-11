/**
 * Get underlying Node web stream API but export as a type that enforces both
 * node and web compatibility. The vite configuration of this project replaces
 * this file with one that returns the web globals.
 *
 * This file is used for the `tsc` build meant for node. `browser-stream.ts` is
 * used for the Vite build meant for the browser. This is performed via an alias
 * `tc-message-toolkit/stream`.
 *
 * This technique avoids conditional `import()` which would cause unecessary
 * asynchronous interface in some areas.
 *
 * @private Use The `tc-message-toolkit/stream` alias
 * @packageDocumentation
 */
import {
  TransformStream as NodeTransformStream,
  ReadableStream as NodeReadableStream,
} from 'node:stream/web'

export const TransformStream = NodeTransformStream as
  | typeof window.TransformStream
  | typeof NodeTransformStream

export const ReadableStream = NodeReadableStream as
  | typeof window.ReadableStream
  | typeof NodeReadableStream
