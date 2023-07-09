import { describe, expect } from 'vitest'
import { ReadableStream } from 'node:stream/web'

import { test } from './fixtures/wrappers'
import { default as tokeniser } from '../src/tokeniser'
import {
  BasicMessageStream,
  BasicMessageStreamChunk,
  SemanticMessageStream,
} from '../src/parser'
import { getAsyncIterableFor } from '../src/lib/async-iterable'
import { defaultMessageTypeRepository } from '../src/messages/repository'
import {
  MultiAttributeMessage,
  SingleAttributeMessage,
} from '../src/messages/types'
import { AnsiLoggerStream } from '../src/parser/streams/ansi-logger'

describe('Parser', () => {
  describe('Basic Message Stream', () => {
    test('sadsad', async () => {
      const myString = `###teamcity[s '|[Diff|cult|r|nmes|'sage |0x0134|]' ] asd ##teamcity[ccccc asd='asd' ]
##teamcity[bbbbbb 'fdg' ]`

      const readable = new ReadableStream({
        start(controller) {
          const chunks = myString.split('\n').map((line) => line + '\n')
          chunks.forEach((chunk) => {
            controller.enqueue(chunk)
          })
          controller.close()
        },
      })

      const transformStream = new BasicMessageStream()

      const transformed = readable
        .pipeThrough(tokeniser.stream())
        // @ts-ignore
        .pipeThrough(transformStream)

      ;(async function () {
        for await (const line of getAsyncIterableFor(transformed)) {
          console.log(line)
        }
      })()
    })
  })

  describe.only('Semantic Message Stream', () => {
    test('sadsad', async () => {
      const myString = `###teamcity[dsadasdasd '|[Diff|cult|r|nmes|'sage |0x0134|]' ] asd ##teamcity[testStarted ssss='asd' ]
      ##teamcity[flowStarted parent='124' ]
      Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum metus odio, suscipit nec r
      honcus nec, scelerisque at dui. Donec vitae erat felis. Aenean tempor risus nisi, vitae dapibus ligul
      a tempor molestie. Morbi ultrices nunc dolor, eu interdum turpis congue eget. Quisque pulvinar nec dui eget convallis. Cras tincidunt blandit tincidunt. Integer 
      lectus ante, laoreet non ante non, cursus rhoncus dui. In semper augue in massa mattis mollis vel sit amet neque. Pellentesque aliquet turpis nec metus condimentum fer
      mentum. Praesent vestibulum a lacus ut vestibulum. Integer euismod, felis sed ultricies aliquet, justo augue vulputate risus, 
      sit amet aliquet erat mauris quis arcu. Pellentesque habitant morbi tristique
       senectus et netus et malesuada fames ac turpis egestas. Aliquam non lorem non lectus hendrerit luctus sit amet ut libero. Nulla vel diam ac
        sapien malesuada auctor. Ut rutrum arcu egestas leo faucibus vehicula et sit amet ligula.
        ##teamcity[flowStarted parent='124' ]
        ##teamcity[testSuiteStarted name='path' flowId='12345']
##teamcity[testSuiteStarted name='to' flowId='12345']
##teamcity[testSuiteStarted name='test1' flowId='12345']
##teamcity[testStarted name='title1' flowId='12345'] sdadasdas ds adas   onvallis. Cra dsadsad   er augue i dsadsad    dsadsad   er augue ier augue ier augue ier augue i dsadsad  dsad  asd asd sad ##teamcity[testFailed name='title1' flowId='12345']
##teamcity[testFinished name='title1' duration='123' flowId='12345']
##teamcity[testSuiteFinished name='test1' flowId='12345']
##teamcity[testSuiteStarted name='test2' flowId='12345']
##teamcity[testStarted name='title2' flowId='12345']
##teamcity[testIgnored name='title2' message='pending' flowId='12345']
e erat felis. Aenean tempor risus nisi, vitae dapibus ligul
      a tempor molestie. Morbi ultrices nunc dolor, eu interdum turpis congue eget. Quisque pulvinar nec dui eget convallis. Cras tincidunt blandit tincidunt. Integer 
      lectus ante, laoreet non ante non, cursus rhoncus dui. In semper augue in massa mattis mollis vel sit amet neque. Pellentesque aliquet turpis nec metus condimentum fer
      mentum. Praesent vestibulum a lacus ut vestibulum. Integer euismod, felis sed ultricies aliquet, justo augue vulputate risus, 
      sit amet aliquet erat mauris quis arcu. Pellentesq

##teamcity[testFinished name='title2' duration='123' flowId='12345']
##teamcity[testSuiteFinished name='test2' flowId='12345']
##teamcity[testSuiteFinished name='to' flowId='12345']
##teamcity[testSuiteFinished name='path' flowId='12345']
##teamcity[testSuiteFinished name='foo/__tests__/file.js' flowId='12345']
##teamcity[testSuiteStarted name='foo/__tests__/file2.js' flowId='12345']
e erat felis. Aenean tempor risus nisi, vitae dapibus ligul
      a tempor molestie. Morbi ultrices nunc dolor, eu interdum turpis congue eget. Quisque pulvinar nec dui eget convallis. Cras tincidunt blandit tincidunt. Integer 
      lectus ante, laoreet non ante non, cursus rhoncus dui. In semper augue in massa mattis mollis vel sit amet neque. Pellentesque aliquet turpis nec metus condimentum fer
      mentum. Praesent vestibulum a lacus ut vestibulum. Integer euismod, felis sed ultricies aliquet, justo augue vulputate risus, 
      sit amet aliquet erat mauris quis arcu. Pellentesq
##teamcity[testSuiteStarted name='path2' flowId='12345']
##teamcity[testSuiteStarted name='to' flowId='12345']
##teamcity[testSuiteStarted name='test3' flowId='12345']
##teamcity[testStarted name='title3' flowId='12345']
##teamcity[testFinished name='title3' duration='123' flowId='12345']
##teamcity[testSuiteFinished name='test3' flowId='12345']
##teamcity[testSuiteStarted name='test4' flowId='12345']
##teamcity[testStarted name='title4' flowId='12345']
##teamcity[testFailed name='title5' message='Unexpected exception' details='at path/to/file1.js:1|n    at path/to/file2.js:2' flowId='12345']
##teamcity[testFinished name='title5' duration='123' flowId='12345']
##teamcity[testSuiteFinished name='test5' flowId='12345']
##teamcity[testSuiteStarted name='constructor' flowId='12345']
##teamcity[testStarted name='title6' flowId='12345']
##teamcity[testFinished name='title6' duration='123' flowId='12345']
##teamcity[testSuiteFinished name='constructor' flowId='12345']
##teamcity[testSuiteFinished name='to' flowId='12345']
##teamcity[testSuiteFinished name='path2' flowId='12345']
##teamcity[testSuiteFinished name='foo/__tests__/file2.js' flowId='12345']`

      const readable = new ReadableStream<string>({
        start(controller) {
          const chunks = myString.split('\n').map((line) => line + '\n')
          chunks.forEach((chunk) => {
            controller.enqueue(chunk)
          })
          controller.close()
        },
      })

      const basicStream = new BasicMessageStream()
      const semanticStream = new SemanticMessageStream({
        repository: defaultMessageTypeRepository,
        allowUnknownMessageTypes: true,
      })

      const transformed = readable
        .pipeThrough(tokeniser.stream())

        .pipeThrough<BasicMessageStreamChunk>(basicStream)
        .pipeThrough<
          SingleAttributeMessage<any, any> | MultiAttributeMessage<any, any>
        >(semanticStream)
        .pipeThrough(new AnsiLoggerStream())

      ;(async function () {
        for await (const line of getAsyncIterableFor(transformed)) {
        }
      })()
    })
  })
})
