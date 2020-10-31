## megvii-svg-icons

> 基于 svg 的图标管理和组件化方案

<p align="left>

![](./flow-chart.jpg)
</p>

整体工作流程分为两步：

1. 管理平台，在这里可以新建一个项目，然后导入需要使用的 svg 图标，当然也能对图标进行增删改查等操作；
2. 项目中使用，在管理平台上的项目都有一个唯一标识 alias，通过这个标识符，可以在项目中使用时只拉取该项目下的图标，避免引入项目以外的图标；为了使图标组件和图标数据集分离，并且能够保证数据有更新后，项目里能够即时同步，需要配置一个 webpack loader，将项目的 alias 传入该 loader，即可实现管理平台上图标有更新后，无需重新构建和发布组件包即可使用到最新的图标；

### vue 组件，@megvii-icons/vue-svg-icons

支持设置渐变、多色、兼容本地 svg 组件等特性，支持通过配置 webpack loader 自动同步管理平台上的图标数据集，也可以加载本地的图标数据集；

* **基本用法**

```js
import Vue from 'vue';
import VueSvgIcons from '@megvii-icons/vue-svg-icons';

Vue.use(VueSvgIcons, {
  tagName: 'xxx-icon'
});
```

```html
<template>
  <xxx-icon
    name="icon1"
    color="red green">
  </xxx-icon>
</template>
```

* Plugin Props

| 名称 | 类型 | 默认值 | 说明 |
| ----- | ----- | ----- | ----- |
| svgIcons | object | - | svg数据集 |
| tagName | string | meg-icon | 组件名 |
| classPrefix | string | meg | class前缀 |
| isStroke | boolean | false | 默认使用描边样式 |
| defaultWidth | string | - | 默认宽 |
| defaultHeight | string | - | 默认高 |

* Component Props

| 名称 | 类型 | 默认值 | 说明 |
| ----- | ----- | ----- | ----- |
| component | VueComponent | - | svg 组件 |
| rotate | number | false | 旋转角度 |
| spin | boolean | false | 是否添加旋转动画，实现loading效果 |
| icon | string | - | 图标名称 |
| name | string | - | 图标名称 |
| width | string | - | 图标宽 |
| height | string | - | 图标高 |
| scale | number | - | 放大倍数 |
| fill | boolean | true | 使用填充样式 |
| color | string | - | 颜色 |
| title | string | - | 标题 |

### 使用 webpack loader 自动同步数据集

在项目中安装 @megvii-icons/pull-svg-icons，并修改 webpack 配置，参考：

```js
rules: [
  {
    test: /main\.jsx$/,
    loader: '@megvii-icons/pull-svg-icons',
    options: {
      requestUri: 'http://example.com/svg-icons/pull-svg-icons',
      projects: 'megdesign'
    }
  }
]
```

相关配置参数：

| 名称 | 类型 | 默认值 | 说明 |
| ----- | ----- | ----- | ----- |
| requestUri | string | - | 拉取图标数据集的接口 |
| projects | string | common | 项目 alias，多个用逗号隔开 |
| pkgName | string | @megvii-icons/vue-svg-icons | 图标组件的包名，当在 vue3 中时需要传 @megvii-icons/vue3-svg-icons |
| cacheResponse | boolean | true | 是否缓存已拉取过来的图标数据集，为 true 时，当图标有更新后，需要重启应用 |

### 使用管理平台导出或 svg2js 生成的 svg 数据集

在管理平台上可以导出指定项目的 svg 数据集，同时也支持使用包自带的 svg2js 命令将本地的 svg 转换成组件可用的数据集；

1. 生成本地的 svg 数据集
```js
svg2js assets/svgs --out assets/js/svgs.js
```

2. 使用生成的数据集
```js
import Vue from 'vue';
import VueSvgIcons from '@megvii-icons/vue-svg-icons';
import SvgIcons from 'assets/js/svgs.js';

Vue.use(VueSvgIcons, {
  tagName: 'xxx-icon',
  svgIcons: SvgIcons
});
```

### @megvii-icons/svgo

优化 svg 信息，删除多余节点，压缩 svg 体积，并将节点信息转为 js，方便统一管理和进一步的优化工作；

```js
const { SvgOptimize } = require('@megvii-icons/svgo');
const svgo = new SvgOptimize({/* svgo options */});

(async () => {
  /**
   * svgInfo: {
   *  name: string;
   *  data: string;
   *  viewBox: string;
   *  width: number;
   *  height: number;
   * }
   */
  const svgInfo = await svgo.build('svg-filename', 'svg-content');
})();
```
