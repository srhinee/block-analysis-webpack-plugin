const plugin = jest.fn();

beforeAll(() => {
  console.log("plugin is init");
});

exports.plugin = plugin;
