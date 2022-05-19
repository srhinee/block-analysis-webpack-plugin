const PLUGIN_NAME = "webpackModuleGraphPlugin";

const {
  originHandel,
  optimizeHandel,
  emitHandel,
} = require("./webpack4Handler.js");
module.exports = (startServer) => {
  return class webpackModuleGraphPlugin {
    constructor(options = {}) {
      if (options.open === undefined) this.open = true;
      else this.open = options.open;
    }

    apply(compiler) {
      compiler.hooks.compilation.tap(PLUGIN_NAME, (compilation, callback) => {
        //Make sure that the trigger timing is the official compilation, not the compilation for generating CSS modules
        if (!compilation.compiler.parentCompilation) {
          compilation.hooks.seal.tap(PLUGIN_NAME, () =>
            originHandel(compilation)
          );

          compilation.hooks.beforeModuleAssets.tap(PLUGIN_NAME, () =>
            optimizeHandel(compilation)
          );

          compilation.hooks.afterSeal.tap(PLUGIN_NAME, async () => {
            let result = await emitHandel(compilation);
            if (this.resolver) this.resolver(result);
            if (this.open) startServer();
          });
        }
      });
    }

    then(resolver) {
      this.resolver = resolver;
    }
  };
};
