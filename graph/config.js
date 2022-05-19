(function initG6() {
  const container = document.getElementById("container");
  const model = document.getElementById("model");
  const width = container.scrollWidth;
  const height = container.scrollHeight || 500;
  const moduleMap = {
    root: { color: "#666" },
    chunk: { color: "#683e9f" },
    ImportDependenciesBlock: { color: "rgb(255,153,102)" },
    AsyncDependenciesBlock: { color: "#d3aa81" },
    AMDRequireDependenciesBlock: { color: "rgb(255,102,102)" },
    RequireEnsureDependenciesBlock: { color: "rgb(191,115,115)" },
    NormalModule: { color: "#69c0ff" },
    ConcatenatedModule: { color: "#66CCCC" },
    ContextModule: { color: "#FF99CC" },
    MultiModule: { color: "#35caa2" },
    CssModule: { color: "#90b56b" },
    DllModule: { color: "#ae72a1" },
    DelegatedModule: { color: "#ae1f6b" },
    ExternalModule: { color: "#b253cc" },
  };
  const config = {
    container: "container",
    width,
    height,
    modes: {
      default: [
        "drag-canvas",
        "zoom-canvas",
        {
          type: "tooltip",
          formatText(item) {
            return item.originLabel;
          },
          shouldBegin(e) {
            let data = e.item._cfg.model;
            return data.originLabel.length > 10;
          },
          offset: 10,
        },
      ],
    },
    defaultNode: {
      type: "rect",
      size: [60, 20],
      style: {
        radius: 5,
        stroke: "#69c0ff",
        fill: "#ffffff",
        lineWidth: 1,
        cursor: "pointer",
        fillOpacity: 1,
      },
      labelCfg: {
        style: {
          fill: "#595959",
          fontSize: 8,
        },
        position: "center", //无效
        offset: 10,
      },
    },
    nodeStateStyles: {
      hover: {
        lineWidth: 1,
        stroke: "#1890ff",
        fill: "#e6f7ff",
      },
    },
  };
  let isOriginal = true,
    isGraph = false;
  let graph;

  function deepClone(obj) {
    let newObj = Array.isArray(obj) ? [] : {};
    if (obj && typeof obj === "object") {
      for (let key in obj) {
        if (obj.hasOwn(key)) {
          newObj[key] =
            obj && typeof obj[key] === "object"
              ? deepClone(obj[key])
              : obj[key];
        }
      }
    }
    return newObj;
  }

  function nodeHandler(node) {
    node.style.stroke = moduleMap[node.meta.type]?.color;
    node.labelCfg.style.fill =
      node.children?.length > 1 && node.collapsed ? "#69c0ff" : "#666";
    if (!node.originLabel) {
      node.originLabel = node.label;
      if (node.label.length > 10) {
        node.label = node.label.slice(0, 10) + "...";
      }
    }
    return node;
  }

  function initTree(data) {
    let c = deepClone(config);
    c.defaultEdge = {
      type: "cubic-horizontal",
      style: {
        radius: 5,
        lineWidth: 1,
        strokeOpacity: 0.6,
        lineDash: [2, 3],
        stroke: "#5c8b8a",
      },
    };
    c.layout = {
      type: "mindmap",
      direction: "H",
      getWidth(d) {
        return 10;
      },
      getHeight(d) {
        return 20;
      },
      getVGap(d) {
        return 10;
      },
      getHGap(d) {
        return 40;
      },
    };
    c.modes.default.push({
      type: "collapse-expand",
      trigger: "dblclick",
      onChange: function onChange(item, collapsed) {
        const node = item.get("model");
        node.collapsed = collapsed;
        return true;
      },
    });
    graph = new G6.TreeGraph(c);
    graph.data(data);
    graph.node(nodeHandler);
    graph.render();
    graph.fitView();
    registerGraph(graph);
  }

  function initGraph(data) {
    let c = deepClone(config);
    c.modes.default = c.modes.default.concat(
      [
        // "drag-combo",
        // "collapse-expand-combo"
        // "drag-node"
      ].concat([performanceData.moduleNums < 500 ? "activate-relations" : ""])
    );
    c.defaultCombo = {
      type: "circle",
      style: {
        fill: "#ddd",
        stroke: "#999",
        cursor: "pointer",
        opacity: 0.4,
      },
      labelCfg: {
        refY: -30,
        position: "top",
        style: {
          fontSize: 16,
          fill: "#666",
          fontFamily: "Gill Sans",
        },
      },
    };
    c.comboStateStyles = {
      active: {
        stroke: "rgba(238,86,86,0.66)",
        fill: "#eee",
      },
    };
    c.edgeStateStyles = {
      inactive: {
        stroke: "#5c8b8a",
      },
    };
    c.defaultEdge = {
      type: "cubic",
      style: {
        endArrow: {
          path: G6.Arrow.triangle(5, 8, 10),
          fill: "#5c8b8a",
          stroke: false,
          lineDash: [100],
          d: 10,
        },
        radius: 5,
        lineWidth: 1,
        strokeOpacity: 0.6,
        lineDash: [2, 3],
        stroke: "#5c8b8a",
      },
    };
    c.layout = {
      type: "comboCombined",
      workerEnabled: true,
    };
    graph = new G6.Graph(c);
    graph.node(nodeHandler);
    graph.data(data);
    graph.render();
    registerGraph(graph);
  }

  function registerGraph(graph) {
    if (!isGraph) {
      let hoverList = [];
      let addList = (v) => {
        let instance = graph.findById(v);
        if (!instance) console.warn(v + "is collapsed");
        else hoverList.push(instance);
      };
      graph.on("node:mouseenter", (evt) => {
        const { item } = evt;
        let { repeatNodes, parentNode, meta } = item._cfg.model;
        if (meta.type === "root" || meta.type === "chunk") return;
        if (parentNode) {
          let c = graph.findById(parentNode);
          if (!c) console.warn(parentNode + "is collapsed");
          else {
            let allNodes = c._cfg.model.repeatNodes;
            allNodes.forEach(addList);
            hoverList.push(c);
          }
        }
        if (repeatNodes?.length) {
          repeatNodes.forEach(addList);
        }
        hoverList.push(item);
        hoverList.forEach((v) => graph.setItemState(v, "hover", true));
      });

      graph.on("node:mouseleave", (evt) => {
        hoverList.forEach((v) => {
          if (graph.findById(v._cfg.id)) graph.setItemState(v, "hover", false);
        });
        hoverList = [];
      });
    }
    graph.on("node:click", (evt) => {
      const { clientX, clientY, item } = evt;
      //invalid event
      evt.preventDefault();
      evt.stopPropagation();
      if (
        item._cfg.model.meta.type !== "root" &&
        item._cfg.model.meta.type !== "chunk"
      )
        showModel(clientX, clientY, item._cfg.model);
    });
  }

  initTree(originTreeNodeData);

  if (typeof window !== "undefined")
    window.onresize = () => {
      if (!graph || graph.get("destroyed")) return;
      if (!container || !container.scrollWidth || !container.scrollHeight)
        return;
      graph.changeSize(container.scrollWidth, container.scrollHeight);
    };

  let stopPropagation = false;
  const button = document.getElementById("button");
  const button1 = document.getElementById("button1");
  const button2 = document.getElementById("button2");

  function toggle() {
    isOriginal = !isOriginal;
    button.innerHTML = isOriginal ? "optimized" : "original";
    if (isGraph) {
      graph.clear();
      graph.changeData(
        isOriginal ? originGraphNodeData : optimizeGraphNodeData
      );
    } else {
      graph.changeData(isOriginal ? originTreeNodeData : optimizeTreeNodeData);
      graph.fitView();
    }
  }

  function toggleGraph() {
    isGraph = !isGraph;
    button1.innerHTML = !isGraph ? "graph" : "tree";
    graph.destroy();
    if (isGraph)
      initGraph(isOriginal ? originGraphNodeData : optimizeGraphNodeData);
    else initTree(isOriginal ? originTreeNodeData : optimizeTreeNodeData);
  }

  container.addEventListener("click", (e) => {
    if (!stopPropagation) model.style.display = "none";
  });

  let isMouseDown, initX, initY;
  model.addEventListener(
    "mousedown",
    function (e) {
      isMouseDown = true;
      //The distance between the upper left corner of the converged element
      initX = e.offsetX;
      initY = e.offsetY;
      //Set event capture to prevent click on child element offset X is the value of child element
      //However, it doesn't work, it's better to set the child element pointer-events:none
    },
    true
  );

  document.addEventListener("mouseup", function (e) {
    isMouseDown = false;
  });

  document.addEventListener("mousemove", (e) => {
    if (isMouseDown) {
      //client X represents the distance from the upper left corner of the window
      model.style.top = e.clientY - initY + "px";
      model.style.left = e.clientX - initX + "px";
    }
  });

  function genLoader(request) {
    let path = request.replace(/\\/g, "/");
    let loaders = path.split("!");
    let resource = loaders.pop().split("?");
    let result = [];
    loaders.forEach((v) => {
      let pathStack = v.split("/");
      let packageName;
      pathStack.some((i, j) => {
        if (i === "node_modules") return (packageName = pathStack[j + 1]);
        if (i.indexOf("loader") !== -1) return (packageName = i);
      });
      if (!packageName) packageName = "project";
      let options = v.split("??");
      result.push({
        packageName,
        path: options[0],
        indent: options[1],
      });
    });
    return {
      result,
      resource,
    };
  }

  function genTemplate(data) {
    let list = genLoader(data.request);
    let typeColor = moduleMap[data.type]?.color;

    let resourceTemplate = `
			<div class="cell">
				<div class="left">resource:</div>
				<div class="right">${list.resource[0]}</div>
			</div>
		`;
    if (list.resource[1])
      resourceTemplate += `
			<div class="cell">
				<div class="left">query:</div>
				<div class="right">${list.resource[1]}</div>
			</div>
		`;

    let chunksTemplate = data.chunks?.length
      ? `
		<div class="cell">
			<div class="left">chunks:</div>
			<div class="right">${data.chunks.join(",")}</div>
		</div>
		`
      : "";

    let loaderTemplate = list.result.map((v) => {
      let indent = "";
      if (v.indent)
        indent = `
				<div class="item">
					<div class="left">indent:</div>
					<div class="right">${v.indent}</div>
				</div>
			`;
      return `
			<div class="loader">
				<div class="row">
				<div class="item">
					<div class="left">name:</div>
					<div class="right">${v.packageName}</div>
				</div>
				${indent}
				</div>
				<div class="item">
					<div class="left">path:</div>
					<div class="right">${v.path}</div>
				</div>
			</div>
		`;
    });
    let loaders = `
			<div class="loaders">
				<div class="title">loaders:</div>
				${loaderTemplate.reverse().join("")}
			</div>`;

    let depList = "";
    switch (data.type) {
      case "ConcatenatedModule":
        // eslint-disable-next-line no-case-declarations
        let _dep = data.depList
          .filter((v) => v.request)
          .sort((a, b) => {
            if (a.type === "external" && b.type === "concatenated") return -1;
          });
        depList = `<div class="concatenatedDep">
				<div class="title">concatenatedDependenciesList:</div>
				${_dep
          .map(
            (dep) => `<div class="item">
						<div class="left">${dep.type}</div>
						<div class="right">${dep.request}</div>
					</div>`
          )
          .join("")}
				</div>`;
        break;
      case "ContextModule":
        depList = `<div class="contextDep">
				<div class="title">contextDirectoryList:</div>
				${data.depList.map((dep) => `<div class="item">${dep}</div>`).join("")}
				</div>`;
        break;
      case "MultiModule":
        depList = `<div class="contextDep">
				<div class="title">entryList:</div>
				${data.depList.map((dep) => `<div class="item">${dep}</div>`).join("")}
				</div>`;
        break;
    }

    let base = `
			<div class="cell">
				<div class="left">nodeType:</div>
				<div class="right" style="color:${typeColor}">${data.type}</div>
			</div>
			${chunksTemplate}
			${resourceTemplate}
		`;
    if (list.result.length) base += loaders;

    return base + depList;
  }

  function showModel(clientX, clientY, data) {
    const offset = 20;
    const size = 500 + offset * 3;
    model.style.left =
      (width / 2 < clientX ? clientX - size : clientX + offset) + "px";
    model.style.top =
      (height / 2 < clientY ? clientY - size + 200 : clientY + offset) + "px";
    model.style.display = "block";
    stopPropagation = true;
    setTimeout(() => (stopPropagation = false), 100);
    model.innerHTML = genTemplate(data.meta);
  }

  button.innerHTML = isOriginal ? "optimized" : "original";
  button1.innerHTML = !isGraph ? "graph" : "tree";
  button2.innerHTML = "fitView";
  button.addEventListener("click", toggle);
  button1.addEventListener("click", toggleGraph);
  button2.addEventListener("click", function () {
    graph.fitView();
  });
})();
