/**
 * Likely going to hell for this. TSDoc plugin does not allow configuring
 * additional tags so I check the error message for tags I want and nullify that
 * error.
 */

const plugin = require('eslint-plugin-tsdoc')

const originalRule = plugin.rules.syntax

const ALLOWED_TAGS = ['@category', '@ignore']

module.exports = {
  'tsdoc/syntax': {
    ...originalRule,

    create: (context) => {
      const hackedContext = {
        report: (opts) => {
          if (
            opts.messageId === 'tsdoc-undefined-tag' &&
            opts?.data?.unformattedText &&
            ALLOWED_TAGS.some(
              (tag) => opts.data.unformattedText.indexOf(tag) !== -1
            )
          ) {
            return
          }

          return context.report(opts)
        },
      }

      Object.setPrototypeOf(hackedContext, context)

      const originalCreateResult = originalRule.create(hackedContext)
      return originalCreateResult
    },
  },
}
