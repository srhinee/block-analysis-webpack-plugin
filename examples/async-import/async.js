exports = function (name) {
  return import (`./lib/${name}.js`)
}