// 安装
npm i @megvii-icons/vue-svg-icons --registry http://10.199.0.216:4873/

// 使用
import Vue from 'vue';
import SvgIcon from '@megvii-icons/vue-svg-icons';

Vue.use(SvgIcon, {
  tagName: 'meg-icon'
});

// template
<template>
  <meg-icon name="cbg-example"></meg-icon>
</template>
