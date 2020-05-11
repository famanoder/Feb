'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var Koa = _interopDefault(require('koa'));
require('http');

function createApp({

} = {}) {
  const app = new Koa();
  
  return app;
}

exports.createApp = createApp;
