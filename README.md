// 安装
```bash
npm i @megvii-icons/vue-svg-icons --registry http://10.199.0.216:4873/
```

// 使用
```js
import Vue from 'vue';
import SvgIcon from '@megvii-icons/vue-svg-icons';

Vue.use(SvgIcon, {
  tagName: 'meg-icon'
});
```

// template
```html
<template>
  <meg-icon name="cbg-example"></meg-icon>
</template>
```
