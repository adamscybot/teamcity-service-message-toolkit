import { ReadableStream } from 'tc-message-toolkit/stream'

export async function* getAsyncIterableFor<I>(
  readableStream: InstanceType<typeof ReadableStream<I>>
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
