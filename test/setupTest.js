const plugin = jest.fn ()
const PLUGIN_NAME = "webpackModuleGraphPlugin"

beforeAll (() => {
  console.log ('plugin is init')
})

exports.plugin = plugin

