const webpack = require ('webpack')

const plugin = require ('../lib/')
const config = require ('../examples/simple/webpack.config.js')

let result
beforeAll (() => {
  return new Promise (resolve => {
    config.plugins.pop ()
    let instance = new plugin ({open: false})
    instance.then (data => resolve (data))
    config.plugins.push (instance)
    config.mode = 'development'
    const compiler = webpack (config)
    compiler.run ()
  }).then (data => result = data)
}, 10000)


it ('should result is defined', function () {
  expect (result).toBeDefined ()
})

describe ('test simple example development case', () => {


  it ('should result module nums is 5', function () {
    expect (result.performanceData.moduleNums).toEqual (5)
  })

  it ('should result chunk nums is 2', function () {
    expect (result.performanceData.chunkNums).toEqual (2)
  })

  it ('should result snapshot is valid', function () {
    expect (result).toMatchSnapshot ()
  })
})

describe ('valid plugin output data', () => {
  it ('should originTreeNodeData has length', function () {
    expect (result.originTreeNodeData.children.length).toBeGreaterThan (0)
  })

  it ('should optimizeTreeNodeData has length', function () {
    expect (result.optimizeTreeNodeData.children.length).toBeGreaterThan (0)
  })

  it ('should originGraphNodeData has length', function () {
    expect (result.originGraphNodeData.nodes.length).toBeGreaterThan (1)
  })

  it ('should optimizeGraphNodeData has length', function () {
    expect (result.optimizeGraphNodeData.nodes.length).toBeGreaterThan (1)
  })
})
