const fs = require ("fs");
const { sep } = require ("path");

const PLUGIN_NAME = "webpackModuleCounterPlugin";
const extraceBlockInfoMap = compilation => {
	/** @type {Map<DependenciesBlock, { modules: Iterable<Module>, blocks: AsyncDependenciesBlock[]}>} */
	const blockInfoMap = new Map ();

	/**
	 * @param {Dependency} d dependency to iterate over
	 * @returns {void}
	 */
	const iteratorDependency = d => {
		// We skip Dependencies without Reference
		const ref = compilation.getDependencyReference (currentModule, d);
		if (!ref) {
			return;
		}
		// We skip Dependencies without Module pointer
		const refModule = ref.module;
		if (!refModule) {
			return;
		}
		// We skip weak Dependencies
		if (ref.weak) {
			return;
		}

		blockInfoModules.add (refModule);
	};

	/**
	 * @param {AsyncDependenciesBlock} b blocks to prepare
	 * @returns {void}
	 */
	const iteratorBlockPrepare = b => {
		blockInfoBlocks.push (b);
		blockQueue.push (b);
	};

	/** @type {Module} */
	let currentModule;
	/** @type {DependenciesBlock} */
	let block;
	/** @type {DependenciesBlock[]} */
	let blockQueue;
	/** @type {Set<Module>} */
	let blockInfoModules;
	/** @type {AsyncDependenciesBlock[]} */
	let blockInfoBlocks;

	for (const module of compilation.modules) {
		blockQueue = [module];
		currentModule = module;
		while (blockQueue.length > 0) {
			block = blockQueue.pop ();
			blockInfoModules = new Set ();
			blockInfoBlocks = [];

			if (block.variables) {
				for (const variable of block.variables) {
					for (const dep of variable.dependencies) iteratorDependency (dep);
				}
			}

			if (block.dependencies) {
				for (const dep of block.dependencies) iteratorDependency (dep);
			}

			if (block.blocks) {
				for (const b of block.blocks) iteratorBlockPrepare (b);
			}

			const blockInfo = {
				modules: blockInfoModules,
				blocks: blockInfoBlocks
			};
			blockInfoMap.set (block, blockInfo);
		}
	}
	return blockInfoMap;
};

const toGraphData = (node) => {
	let length = node.children.length;
	if (node.id.substr (1) < 5) node.collapsed = false;
	// if (node.meta.type === "ConcatenatedModule") node.collapsed = false;
	else node.collapsed = length > 4;
	node.children.forEach (n => toGraphData (n));
	return node;
};
const dataTemplate = ({
	originTreeNodeData,
	optimizeTreeNodeData,
	originGraphNodeData,
	performanceData
}) => `
  (function (){
  window.originalData=${JSON.stringify (toGraphData (originTreeNodeData))}
  window.optimizeData=${JSON.stringify (toGraphData (optimizeTreeNodeData))}
  window.originalData_=${JSON.stringify (originGraphNodeData)}
  window.performanceData=${JSON.stringify (performanceData)}
  }())
  `;

const genRequest = request => {
	return request.replace (/\\/g, "/");
};

const baseRoot = {
	id: "N0",
	label: "root",
	meta: { type: "root" },
	children: []
};

let index = 1;
const getNode = (block, type) => {
	let result, request, requestList;
	switch (type) {
		case "AsyncDependenciesBlock":
		case "ImportDependenciesBlock":
			requestList = block.request.split ("/");
			result = {
				label: requestList.pop () || requestList.pop (),
				meta: { type, request: block.request }
			};
			break;
		case "AMDRequireDependenciesBlock":
			request = genRequest (block.module.resource);
			result = {
				label: request.split ("/").pop (),
				meta: {
					type,
					request: block.module.request
				}
			};
			break;
		case "NormalModule":
			request = genRequest (block.resource);
			requestList = request.split ("/");
			let label = requestList.pop ();
			if (label.startsWith ("index.vue") || label.startsWith ("index.js")) {
				label = requestList.pop ();
			} else {
				let queryIndex = label.lastIndexOf ("?");
				if (queryIndex !== -1) label = label.substr (0, queryIndex);
			}
			result = {
				label,
				meta: { type, request: block.request }
			};
			break;
		case "ConcatenatedModule":
			request = genRequest (block.rootModule.resource);
			result = {
				label: request.split ("/").pop (),
				meta: {
					type,
					request: block.rootModule.request,
					depList: block._orderedConcatenationList.map (v => ({
						type: v.type,
						request: v.module.resource
					}))
				}
			};
			break;
		case "ContextModule":
			result = {
				label: block.options.request,
				meta: {
					type,
					request: block.options.resource,
					depList: [...block.dependencies.map (v => v.request),
						...block.blocks.map (v => v.request)]
				}
			};
			break;
		case "MultiModule":
			result = {
				label: block.name,
				meta: {
					type,
					request: block._identifier,
					depList: block.dependencies.map (v => v.request)
				}
			};
			break;
		case "CssModule":
			request = genRequest (block.issuer.context);
			result = {
				label: request.split ("/").pop (),
				meta: {
					type,
					request: block._identifier
				}
			};
			break;
		case "RawModule":
		case "ExternalModule":
		case "DelegatedModule":
		case "DllModule":
		default:
			result = {
				label: "unknown module",
				meta: { type }
			};
			break;
	}
	result.children = [];
	result.id = "N" + index++;
	block._moduleTreeId = result.id;
	return result;
};

const OriginNodes = [baseRoot], OriginEdges = [], COMBOS = [];
module.exports = class webpackModuleCounterPlugin {
	apply (compiler) {
		compiler.hooks.compilation.tap (PLUGIN_NAME, (compilation, callback) => {
			if (!compilation.compiler.parentCompilation) compilation.hooks.afterHash.tap (PLUGIN_NAME, () => {
				const { modules, chunks, entries } = compilation;
				const entryChunks = chunks.filter (c => !!c.entryModule);
				const blockInfoMap = extraceBlockInfoMap (compilation);

				let moduleSet = new Set ();
				let moduleTreeIds = new Set ();

				chunks.forEach (c => {
					if (c.name) {
						COMBOS.push ({
							id: c.id,
							label: c.name
						});
					}
				});
				const iteratorDep = (blocks, parentNode) => {
					blocks.forEach (block => {
						if (moduleSet.has (block)) {
							OriginEdges.push ({
								source: parentNode.id,
								target: block._moduleTreeId
							});
							return moduleTreeIds.add (block._moduleTreeId);
						} else moduleSet.add (block);

						const moduleTree = getNode (block, block.constructor.name);
						const { modules, blocks } = blockInfoMap.get (block);
						const { id, meta, label } = moduleTree;

						if (block._chunks) {
							const comboId = block._chunks.values ().next ().value.id;
							OriginNodes.push ({ id, meta, label, comboId });
							OriginEdges.push ({ source: parentNode.id, target: id });
						}

						if (modules.size) iteratorDep (modules, moduleTree);
						if (blocks.length) iteratorDep (blocks, moduleTree);

						parentNode.children.push (moduleTree);
					});
				};
				const iteratorChunk = (chunk, block, result) => {

					if (moduleSet.has (block)) return moduleTreeIds.add (block._moduleTreeId);
					else moduleSet.add (block);

					const moduleTree = getNode (block, block.constructor.name);
					const { modules, blocks } = blockInfoMap.get (block);

					if (modules.size) {
						const interModules = new Set ([...modules].filter (x => chunk._modules.has (x)));
						interModules.forEach (b => iteratorChunk (chunk, b, moduleTree.children));
					}
					if (blocks.length) {
						blocks.forEach (b => {
							const blockChunks = chunks.filter (c => {
								const group = c._groups.values ().next ().value;
								return group && group._blocks.has (b);
							});
							blockChunks.forEach (c => iteratorChunk (c, b, moduleTree.children));
						});
					}

					result.push (moduleTree);
				};

				iteratorDep (entries, baseRoot);
				const originTreeNodeData = Object.assign ({}, baseRoot);

				baseRoot.children = [];
				index = 1;
				moduleSet = new Set ();

				entryChunks.forEach (c => iteratorChunk (c, c.entryModule, baseRoot.children));
				const optimizeTreeNodeData = Object.assign ({}, baseRoot);

				fs.exists ("graph", exists => {
					if (!exists) fs.mkdirSync ("graph");
					fs.writeFile ("graph/data.js", dataTemplate ({
						originTreeNodeData,
						optimizeTreeNodeData,
						originGraphNodeData: {
							nodes: OriginNodes,
							edges: OriginEdges,
							combos: COMBOS
						},
						performanceData: {
							chunkNums: chunks.length,
							moduleNums: modules.length,
							entriesNums: entries.length,
							repeatTreeIds: Array.from (moduleTreeIds)
						}
					}), (err) => {if (err) throw err;});
				});
			});
		});
	}
};
