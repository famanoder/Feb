import Koa from 'koa';
import http from 'http';

export function createApp({

} = {}) {
  const app = new Koa();
  
  return app;
}