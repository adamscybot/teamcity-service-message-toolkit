import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'

import tcDummyLogger, { TcDummyTestRunnable } from './logger.js'

const argv = await yargs(hideBin(process.argv)).options({
  testDuration: {
    alias: 'd',
    type: 'number',
    demandOption: true,
    description:
      'A duration in a format accepted by the `parse-duration` package that will be the length of time each individual test takes to "run".',
  },
  numberOfSuites: {
    alias: 'a',
    type: 'number',
    demandOption: true,
    description: 'The number of test suites.',
  },
  numberOfIgnoredTests: {
    alias: 'i',
    type: 'number',
    demandOption: true,
    description: 'The number of ignored tests per suite.',
  },
  numberOfSuccessfulTests: {
    alias: 's',
    type: 'number',
    demandOption: true,
    description: 'The number of successful tests per suite.',
  },
  numberOfFailedTests: {
    alias: 'f',
    type: 'number',
    demandOption: true,
    description: 'The number of failed tests per suite. ',
  },
  realTime: {
    alias: 'r',
    type: 'boolean',
    description:
      'Whether the time provided by `--testDuration` is actually waited on, as opposed to just injecting it into the TC log lines only.',
  },
}).argv

const logger = tcDummyLogger()
  .pipe(process.stdout)
  .beforeTestAdded((test, count) =>
    test instanceof TcDummyTestRunnable
      ? test
          .name(`Test ${count}`)
          .duration('5s', { realTime: argv.realTime ?? false })
      : test.name(`Test ${count}`).message(`Ignored message ${count}`)
  )
  .beforeSuiteAdded((suite, count) => suite.name(`Suite ${count}`))

for (let _i of Array(argv.numberOfSuites).keys()) {
  logger.addSuite((suite) => {
    for (let _j of Array(argv.numberOfSuccessfulTests).keys()) {
      suite.addTest((test) => test.succeeds().body('Sucessful test content'))
    }
    for (let _j of Array(argv.numberOfFailedTests).keys()) {
      suite.addTest((test) => test.fails().body('Failed test content'))
    }
    for (let _j of Array(argv.numberOfIgnoredTests).keys()) {
      suite.addTest((test) => test.ignored().message('Ignored'))
    }

    return suite
  })
}

logger.exec()
