const MAPPINGS = {
  vitest: 'file:vitest-0.32.2.tgz',
  'vite-node': 'file:vite-node-0.32.2.tgz',
  '@vitest/coverage-c8': 'file:vitest-coverage-c8-0.32.2.tgz',
  '@vitest/coverage-istanbul': 'file:vitest-coverage-istanbul-0.32.2.tgz',
  '@vitest/coverage-v8': 'file:vitest-coverage-v8-0.32.2.tgz',
  '@vitest/expect': 'file:vitest-expect-0.32.2.tgz',
  '@vitest/runner': 'file:vitest-runner-0.32.2.tgz',
  '@vitest/snapshot': 'file:vitest-snapshot-0.32.2.tgz',
  '@vitest/spy': 'file:vitest-spy-0.32.2.tgz',
  '@vitest/ui': 'file:vitest-ui-0.32.2.tgz',
  '@vitest/utils': 'file:vitest-utils-0.32.2.tgz',
  '@vitest/web-worker': 'file:vitest-web-worker-0.32.2.tgz',
  '@vitest/ws-client': 'file:vitest-ws-client-0.32.2.tgz',
}

function readPackage(pkg) {
  Object.entries(MAPPINGS).forEach(([packageName, alias]) => {
    if (pkg.dependencies && pkg.dependencies[packageName]) {
      pkg.dependencies[packageName] = alias
    }
  })

  return pkg
}

module.exports = {
  hooks: {
    readPackage,
  },
}
