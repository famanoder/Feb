// 安装
```bash
npm i @megvii-icons/vue-svg-icons --registry http://10.199.0.216:4873/
```

* webpack-chain 配置
```js
chainWebpack(config) {
  config.module
    .rule('meg-icon')
    .test(/\.js$/)
    .use('pull-svg-icons')
    .loader('@megvii-icons/pull-svg-icons')
    .tap(() => {
      return {
        requestUri: 'https://fe-cms.mcd.megvii-inc.com/v1/feicons/svg/pullSvgIcons',
        projects: 'cbg-icons'
      }
    });
}
```
