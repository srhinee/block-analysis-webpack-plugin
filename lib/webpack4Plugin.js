const PLUGIN_NAME = "webpackModuleGraphPlugin"

const handler = require ('./webpack4Handler.js')

module.exports = (startServer) => {
  return class webpackModuleGraphPlugin {
    constructor (options = {}) {
      if (options.open === undefined) this.open = true
      else this.open = options.open
    }

    apply (compiler) {
      compiler.hooks.compilation.tap (PLUGIN_NAME, (compilation, callback) => {
        //Make sure that the trigger timing is the official compilation, not the compilation for generating CSS modules
        if (!compilation.compiler.parentCompilation) {
          compilation.hooks.afterHash.tap (PLUGIN_NAME, async () => {
            await handler (compilation)
            if (this.open) startServer ()
          })
        } else {
          debugger
        }
      })
    }
  }
}


