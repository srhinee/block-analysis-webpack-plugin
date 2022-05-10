const PLUGIN_NAME = "webpackModuleGraphPlugin"

const handler = require ('./webpack4Handler.js')

module.exports = class webpackModuleGraphPlugin {
  apply (compiler) {
    compiler.hooks.compilation.tap (PLUGIN_NAME, (compilation, callback) => {
      //Make sure that the trigger timing is the official compilation, not the compilation for generating CSS modules
      if (!compilation.compiler.parentCompilation) {
        compilation.hooks.afterHash.tap (PLUGIN_NAME, ()=>handler (compilation))
      }
    })
  }
}
