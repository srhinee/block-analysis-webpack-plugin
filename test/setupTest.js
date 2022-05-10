const plugin = jest.fn ()
const PLUGIN_NAME = "webpackModuleGraphPlugin"

beforeAll (() => {
  console.log ('plugin is init')
})

exports.plugin = plugin

exports.pluginIsCalled = new Promise (resolve => {
  plugin.prototype.apply = compiler => {
    compiler.hooks.compilation.tap (PLUGIN_NAME, (compilation, callback) => {
      if (!compilation.compiler.parentCompilation) {
        compilation.hooks.afterHash.tap (PLUGIN_NAME, () => {
          resolve (compilation)
        })
      }
    })
  }
})