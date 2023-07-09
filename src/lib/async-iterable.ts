import { ReadableStream } from 'node:stream/web'

export async function* getAsyncIterableFor<I>(
  readableStream: ReadableStream<I>
) {
  const reader = readableStream.getReader()
  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) return
      yield value
    }
  } finally {
    reader.releaseLock()
  }
}
