import { defaultMessageTypeRepository } from '../../src/messages/repository.js'

const message1 = defaultMessageTypeRepository.getFactory('testSuiteStarted')({
  rawKwargs: {
    name: 'test',
    timestamp: '2000-10-31T01:30:00.000-05:00',
    dsadas: 'asdsa',
  },
})

console.log(message1.toServiceMessageString())
console.log('OK')
message1.ansi()

const message2 = defaultMessageTypeRepository.getFactory(
  'enableServiceMessages'
)({})

console.log(message2.toServiceMessageString())
