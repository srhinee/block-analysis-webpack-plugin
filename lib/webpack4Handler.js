const fs = require ("fs")
const path = require ("path")

/**
 * Extracts simplified info from the modules and their dependencies
 * @param {Compilation} compilation the compilation
 * @returns {Map<DependenciesBlock, { modules: Iterable<Module>,
 *   blocks: AsyncDependenciesBlock[]}>} the mapping block to modules
 *   and inner blocks
 */
const extraceBlockInfoMap = compilation => {
  /** @type {Map<DependenciesBlock, { modules: Iterable<Module>, blocks: AsyncDependenciesBlock[]}>} */
  const blockInfoMap = new Map ()

  /**
   * @param {Dependency} d dependency to iterate over
   * @returns {void}
   */
  const iteratorDependency = d => {
    // We skip Dependencies without Reference
    const ref = compilation.getDependencyReference (currentModule, d)
    if (!ref) {
      return
    }
    // We skip Dependencies without Module pointer
    const refModule = ref.module
    if (!refModule) {
      return
    }
    // We skip weak Dependencies
    if (ref.weak) {
      return
    }

    blockInfoModules.add (refModule)
  }

  /**
   * @param {AsyncDependenciesBlock} b blocks to prepare
   * @returns {void}
   */
  const iteratorBlockPrepare = b => {
    blockInfoBlocks.push (b)
    blockQueue.push (b)
  }

  /** @type {Module} */
  let currentModule
  /** @type {DependenciesBlock} */
  let block
  /** @type {DependenciesBlock[]} */
  let blockQueue
  /** @type {Set<Module>} */
  let blockInfoModules
  /** @type {AsyncDependenciesBlock[]} */
  let blockInfoBlocks

  for (const module of compilation.modules) {
    blockQueue = [module]
    currentModule = module
    while (blockQueue.length > 0) {
      block = blockQueue.pop ()
      blockInfoModules = new Set ()
      blockInfoBlocks = []

      if (block.variables) {
        for (const variable of block.variables) {
          for (const dep of variable.dependencies) iteratorDependency (dep)
        }
      }

      if (block.dependencies) {
        for (const dep of block.dependencies) iteratorDependency (dep)
      }

      if (block.blocks) {
        for (const b of block.blocks) iteratorBlockPrepare (b)
      }

      const blockInfo = {
        modules: blockInfoModules,
        blocks: blockInfoBlocks
      }
      blockInfoMap.set (block, blockInfo)
    }
  }
  return blockInfoMap
}
/**
 *  In order to better display the tree diagram, the default collapse of nodes with too many child nodes
 *  @param{Object<id,label,meta,children>} node treemap node
 *  @returns{node}
 * */
const toTreeData = (node) => {
  let length = node.children.length
  if (node.id.substr (1) < 5) node.collapsed = false
  // if (node.meta.type === "ConcatenatedModule") node.collapsed = false;
  else node.collapsed = length > 4
  node.children.forEach (n => toTreeData (n))
  return node
}
/**
 * Templated generated graph data
 * @param {node[]} originTreeNodeData
 * @param {node[]} optimizeTreeNodeData
 * @param {Object<OriginNodes,OriginEdges>} originGraphNodeData
 * @param {Object<OptimizeNodes,OptimizeEdges>} optimizeGraphNodeData
 * @param {Object} performanceData
 * @returns string
 * */
const dataTemplate = ({
  originTreeNodeData,
  optimizeTreeNodeData,
  originGraphNodeData,
  optimizeGraphNodeData,
  performanceData
}) => {
  return `
  (function (){
  window.originTreeNodeData=${JSON.stringify (toTreeData (originTreeNodeData))}
  window.optimizeTreeNodeData=${JSON.stringify (toTreeData (optimizeTreeNodeData))}
  window.originGraphNodeData=${JSON.stringify (originGraphNodeData)}
	 window.optimizeGraphNodeData=${JSON.stringify (optimizeGraphNodeData)}
  window.performanceData=${JSON.stringify (performanceData)}
  }())
  `
}
/**
 * replace line breaks uniformly
 * @param {string} request resourcePath
 * @return {string}
 * */
const genRequest = request => {
  return request.replace (/\\/g, "/")
}
/**
 * generate node nodes based on module type
 * @param {Module} block
 * @param {string} type
 * @return {Node}
 * */
const getNode = (block, type) => {
  let result, request, requestList, chunks = []
  switch (type) {
    case "AsyncDependenciesBlock":
    case "ImportDependenciesBlock":
    case "RequireEnsureDependenciesBlock":
    case "AMDRequireDependenciesBlock":
      request = block.request
      if (!request) {
        for (let dep of block.dependencies) {
          if (dep.request) {
            request = dep.request
            break
          }
        }
      }
      requestList = genRequest (request).split ("/")
      if (block.module) {
        for (let chunk of block.module._chunks) chunks.push (chunk.name || chunk.id)
      } else if (block.chunkGroup) {
        for (let chunk of block.chunkGroup.chunks) chunks.push (chunk.name || chunk.id)
      }

      result = {
        label: requestList.pop () || requestList.pop (),
        meta: {type, request, chunks}
      }
      break
    case "NormalModule":
      request = genRequest (block.resource)
      for (let chunk of block._chunks) chunks.push (chunk.name || chunk.id)
      requestList = request.split ("/")
      let label = requestList.pop ()
      if (label.startsWith ("index.vue") || label.startsWith ("index.js")) {
        label = requestList.pop ()
      } else {
        let queryIndex = label.lastIndexOf ("?")
        if (queryIndex !== -1) label = label.substr (0, queryIndex)
      }
      result = {
        label,
        meta: {type, request: block.request, chunks}
      }
      break
    case "ConcatenatedModule":
      request = genRequest (block.rootModule.resource)
      for (let chunk of block._chunks) chunks.push (chunk.name || chunk.id)
      result = {
        label: request.split ("/").pop (),
        meta: {
          type,
          chunks,
          request: block.rootModule.request,
          depList: block._orderedConcatenationList.map (v => ({
            type: v.type,
            request: v.module.resource
          }))
        }
      }
      break
    case "ContextModule":
      for (let chunk of block._chunks) chunks.push (chunk.name || chunk.id)
      result = {
        label: block.options.request,
        meta: {
          type,
          chunks,
          request: block.options.resource,
          depList: [...block.dependencies.map (v => v.request),
            ...block.blocks.map (v => v.request)]
        }
      }
      break
    case "MultiModule":
      for (let chunk of block._chunks) chunks.push (chunk.name || chunk.id)
      result = {
        label: block.name,
        meta: {
          chunks,
          type,
          request: block._identifier,
          depList: block.dependencies.map (v => v.request)
        }
      }
      break
    case "CssModule":
      request = genRequest (block.issuer.context)
      for (let chunk of block._chunks) chunks.push (chunk.name || chunk.id)
      result = {
        label: request.split ("/").pop (),
        meta: {
          type,
          chunks,
          request: block._identifier
        }
      }
      break
    case "DllModule":
      for (let chunk of block._chunks) chunks.push (chunk.name || chunk.id)
      result = {
        label: block.name,
        meta: {
          type,
          chunks,
          request: block.name
        }
      }
      break
    case "RawModule":
    case "ExternalModule":
    case "DelegatedModule":
    default:
      for (let chunk of block._chunks) chunks.push (chunk.name || chunk.id)
      result = {
        label: "unknown module",
        meta: {type, request: 'unknown', chunks: chunks}
      }
      break
  }
  result.children = []
  result.repeatNodes = []
  result.parentNode = null
  result.id = "N" + index++
  if (!block._moduleNode) block._moduleNode = result
  return result
}

/**
 * documentRootNode
 * @type{Object<id:string,label:string,meta:Object<type:string>>} baseRoot
 * */
const baseRoot = {
  id: "N0",
  label: "root",
  meta: {type: "root"}
}

let index = 1

const OriginNodes = [Object.assign ({}, baseRoot)]
const OriginEdges = []

const OptimizeNodes = [Object.assign ({}, baseRoot)]
const OptimizeEdges = []

module.exports = function (compilation) {
  const {modules, chunks, entries} = compilation
  let depEntries = []

  // When entry is of concatenated type, there is no entry in modules
  entries.forEach (entry => {
    if (modules.indexOf (entry) === -1) {
      depEntries = depEntries.concat (modules.filter (module => module.rootModule === entry))
    } else {
      depEntries.push (entry)
    }
  })

  const entryChunks = chunks.filter (c => {
    if (c.entryModule) return true
    if (c.chunkReason) {
      c.entryModule = c._modules.values ().next ().value
      return true
    }
    return false
  })
  const blockInfoMap = extraceBlockInfoMap (compilation)

  let moduleSet = new Set ()
  const iteratorModules = (currentModules, parentNode) => {
    currentModules.forEach (currentModule => {
      const moduleNode = getNode (currentModule, currentModule.constructor.name)
      const {modules, blocks} = blockInfoMap.get (currentModule)
      const {id, meta, label} = moduleNode

      // The blocks that have been processed only add edges, and add parent-child relationships for querying
      if (moduleSet.has (currentModule)) {
        let currentNode = currentModule._moduleNode
        OriginEdges.push ({
          source: parentNode.id,
          target: currentNode.id
        })
        currentNode.repeatNodes.push (id)
        moduleNode.parentNode = currentNode.id
      } else {
        //Add nodes and edges, recursively process child nodes modules and blocks
        OriginNodes.push ({id, meta, label})
        OriginEdges.push ({source: parentNode.id, target: id})

        moduleSet.add (currentModule)
        if (modules.size) iteratorModules (modules, moduleNode)
        if (blocks.length) iteratorModules (blocks, moduleNode)
      }

      parentNode.children.push (moduleNode)
    })
  }
  const iteratorChunk = (chunk, module, parentNode) => {
    // Clear the nodes bound to the previous round to prepare for this round
    //Otherwise, the parent-child dependency will be wrong in optimize phase
    if (!moduleSet.has (module)) delete module._moduleNode

    const moduleNode = getNode (module, module.constructor.name)
    const {modules, blocks} = blockInfoMap.get (module)
    const {id, meta, label} = moduleNode

    if (moduleSet.has (module)) {
      let currentNode = module._moduleNode
      currentNode.repeatNodes.push (id)
      moduleNode.parentNode = currentNode.id
      OptimizeEdges.push ({
        source: parentNode.id,
        target: currentNode.id
      })
    } else {
      OptimizeNodes.push ({id, meta, label})
      OptimizeEdges.push ({source: parentNode.id, target: id})

      moduleSet.add (module)
      if (modules.size) {
        //When the parent and child modules are under the same chunk,
        // it is necessary to perform the next round of recursion
        const interModules = new Set ([...modules].filter (x => chunk._modules.has (x)))
        interModules.forEach (b => iteratorChunk (chunk, b, moduleNode))
      }
      if (blocks.length) {
        //If the chunk group of the current chunk intersects with the parent chunk group of the sub-block,
        // you can continue to recurse sub-chunks
        blocks.forEach (b => {
          let childGroup = b.chunkGroup
          if (childGroup) for (let i of chunk._groups) {
            for (let j of childGroup._parents) {
              if (i === j) childGroup.chunks.forEach (c => iteratorChunk (c, b, moduleNode))
            }
          }
        })
      }
    }
    parentNode.children.push (moduleNode)
  }

  baseRoot.children = []
  iteratorModules (depEntries, baseRoot)
  const originTreeNodeData = Object.assign ({}, baseRoot)

  baseRoot.children = []
  index = 1
  moduleSet = new Set ()

  entryChunks.forEach (c => iteratorChunk (c, c.entryModule, baseRoot))
  const optimizeTreeNodeData = Object.assign ({}, baseRoot)

  const result = {
    originTreeNodeData,
    optimizeTreeNodeData,
    originGraphNodeData: {
      nodes: OriginNodes,
      edges: OriginEdges
    },
    optimizeGraphNodeData: {
      nodes: OptimizeNodes,
      edges: OptimizeEdges
    },
    performanceData: {
      chunkNums: chunks.length,
      chunkIds: chunks.map (v => v.id),
      moduleNums: modules.length,
      entriesNums: entries.length
    }
  }


  return new Promise ((resolve, reject) => {
    let exists = fs.existsSync (path.join (__dirname, "../graph"))
    if (!exists) fs.mkdirSync (path.join (__dirname, "../graph"))
    fs.writeFile (path.join (__dirname, "../graph/data.js"), dataTemplate (result), (err) => {
        if (err) reject (err)
        resolve (result)
      }
    )
  })
}