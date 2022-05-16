const PLUGIN_NAME = "webpackModuleGraphPlugin"


module.exports = (startServer) => {
  return class webpackModuleGraphPlugin {
    constructor (options = {}) {
      if (options.open === undefined) this.open = true
      else this.open = options.open
    }

    apply (compiler) {
    //todo add webpack5 support
    }

    then (resover) {
      this.resolve = resover
    }
  }
}


