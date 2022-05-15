<!-- PROJECT SHIELDS -->
[![GitHub license][license-shield]][license-url]
<!-- PROJECT LOGO -->

<br />

<p align="center">
  <a href="https://github.com/srhinee/block-analysis-webpack-plugin.git">
    <img width="200" height="200" src="https://webpack.js.org/assets/icon-square-big.svg">
  </a>

<h3 align="center">webpack module dependency analysis </h3>
  <p align="center">
    Rendering webpack module dependencies based on the G6 graph visualization engine
    <br />
    <br />
    <a href="">中文</a>
    ·
    <a href="">report bugs</a>
    ·
    <a href="">propose new features</a>
  </p>
</p>

## Contents

- [Demo](#Demo)
- [Get Started](#Get Started)
- [Introduction](#Introduction)
- [Concepts](#Concepts)
- [License](#License)
- [Thanks](#Thanks)

## Demo

![](public/1.gif)

## Get Started

### Install

```shell
# NPM
npm install --save-dev block-analysis-webpack-plugin
# Yarn
yarn add -D block-analysis-webpack-plugin
```

### Usage

```js
const blockAnalyzerPlugin = require ('block-analysis-webpack-plugin');

// webpack.config
module.exports = {
  plugins: [
    new blockAnalyzerPlugin ()
  ]
}
```

## Introduction

此插件可以帮助你查看项目中的模块依赖,分析你项目中各个文件代码是如何在webpack中组织的,插件对webpack
module的结构进行收集并使用G6可视化引擎进行渲染,插件的模式origin和optimize代表了webpack在对chunk进行优化前后的模块结构,并且具有tree和graph两种布局,
点击每一个节点可以查看module的详情,包括module的类型,资源路径,模块依赖,所属的chunk等.

需要说明的是,chunk优化就是webpack的seal阶段进行的一系列行为,seal阶段会有optimizeDependencies,optimizeModules,optimizeChunks等一系列钩子函数来进行最终输出代码的优化,
origin模式下被渲染的节点是发生在seal阶段之前的数据结构,可以理解为项目代码原始的组织结构,optimize模式下的节点是在webpack即将生成bundle时候的数据结构,可以理解为项目打包时的组织结构.

## Concepts



## License

The project is signed under the MIT license,
see [LICENSE.txt](https://github.com/shaojintian/Best_README_template/blob/master/LICENSE.txt)

## Thanks

- [G6](https://g6.antv.vision/zh)
- [Webpack](https://webpack.js.org/)
- [Img Shields](https://shields.io)

<!-- links -->

[license-shield]: https://img.shields.io/github/license/srhinee/block-analysis-webpack-plugin?style=flat-square

[license-url]: https://github.com/srhinee/block-analysis-webpack-plugin/blob/main/LICENSE




