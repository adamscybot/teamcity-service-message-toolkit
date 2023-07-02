// import { Readable } from 'node:stream'
// import { LinearStreamParser, TreeStreamParser } from './parser.js'

// // Fake input stream
// const inputStream = new Readable({
//   read() {},
// })

// const linearStreamParser = new LinearStreamParser()
// const treeStreamParser = new TreeStreamParser()

// inputStream.pipe(linearStreamParser).pipe(treeStreamParser)

// treeStreamParser.on('data', (message: any) => {
//   console.log('A message was received:')
//   console.log(message)
// })

// const logLines = `##teamcity[testSuiteStarted name='foo/__tests__/file.js' flowId='12345']
// hsahldasd dsadas
// dsadsa dsadas
// dsadasdasd
// ##teamcity[testSuiteStarted name='path' flowId='12345']
// ##teamcity[testSuiteStarted name='to' flowId='12345']
// ##teamcity[testSuiteStarted name='test1' flowId='12345']
// ##teamcity[testStarted name='title1' flowId='12345']
// ##teamcity[testFailed name='title1' flowId='12345']
// ##teamcity[testFinished name='title1' duration='123' flowId='12345']
// ##teamcity[testSuiteFinished name='test1' flowId='12345']
// ##teamcity[testSuiteStarted name='test2' flowId='12345']
// ##teamcity[testStarted name='title2' flowId='12345']
// ##teamcity[testIgnored name='title2' message='pending' flowId='12345']
// ##teamcity[testFinished name='title2' duration='123' flowId='12345']
// ##teamcity[testSuiteFinished name='test2' flowId='12345']
// ##teamcity[testSuiteFinished name='to' flowId='12345']
// ##teamcity[testSuiteFinished name='path' flowId='12345']
// ##teamcity[testSuiteFinished name='foo/__tests__/file.js' flowId='12345']
// ##teamcity[testSuiteStarted name='foo/__tests__/file2.js' flowId='12345']
// ##teamcity[testSuiteStarted name='path2' flowId='12345']
// ##teamcity[testSuiteStarted name='to' flowId='12345']
// ##teamcity[testSuiteStarted name='test3' flowId='12345']
// ##teamcity[testStarted name='title3' flowId='12345']
// ##teamcity[testFinished name='title3' duration='123' flowId='12345']
// ##teamcity[testSuiteFinished name='test3' flowId='12345']
// ##teamcity[testSuiteStarted name='test4' flowId='12345']
// ##teamcity[testStarted name='title4' flowId='12345']
// ##teamcity[testFailed name='title5' message='Unexpected exception' details='at path/to/file1.js:1|n    at path/to/file2.js:2' flowId='12345']
// ##teamcity[testFinished name='title5' duration='123' flowId='12345']
// ##teamcity[testSuiteFinished name='test5' flowId='12345']
// ##teamcity[testSuiteStarted name='constructor' flowId='12345']
// ##teamcity[testStarted name='title6' flowId='12345']
// ##teamcity[testFinished name='title6' duration='123' flowId='12345']
// ##teamcity[testSuiteFinished name='constructor' flowId='12345']
// ##teamcity[testSuiteFinished name='to' flowId='12345']
// ##teamcity[testSuiteFinished name='path2' flowId='12345']
// ##teamcity[testSuiteFinished name='foo/__tests__/file2.js' flowId='12345']`

// // Push lines into the stream with 1s interval
// const lines = logLines.split('\n')
// let index = 0
// const intervalId = setInterval(() => {
//   if (index < lines.length) {
//     inputStream.push(lines[index] + '\n')
//     index++
//   } else {
//     // All lines are pushed, close the stream
//     inputStream.push(null)
//     clearInterval(intervalId)
//   }
// }, 1000)
