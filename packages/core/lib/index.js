import Koa from 'koa';
import KoaRouter from 'koa-router';
import { getArgType } from '@iuv-tools/utils';
import { handleRoutes } from './router';
import { responseHelper } from './res-helper';

const router = new KoaRouter();

export * from './exception';

export default class Application extends Koa {
  constructor(config) {
    super();
    this.config = config;
    this.context.config = config;
    this.context.service = Object.create(null);
    this.context.model = Object.create(null);
    responseHelper(this);
  }
  service(services) {
    // 数据操作
    if (getArgType(services).isObject) {
      Object.keys(services).forEach(name => {
        try {
          const service = new services[name](this);
          const serviceName = name.replace(/^\$?[A-Z]/, a => a.toLowerCase());
          // 名称首字母小写
          this.context.service[serviceName] = service; // cx.service.user
          this.context[`$${serviceName}`] = service; // alias: cx.$user
          // 为了区分$model，model的alias首字母大写的驼峰格式
        } catch (e) {
          throw e;
        }
      });
    }
  }
  model(models) {
    // 数据模型
    if (getArgType(models).isObject) {
      Object.keys(models).forEach(name => {
        const model = models[name];
        const modelName = name.replace(/^\$?[a-z]/, a => a.toUpperCase());
        // 名称首字母大写
        this.context.model[modelName] = model; // cx.model.User
        this.context[`$${modelName}`] = model; // alias: cx.$User
      });
    }
  }
  // accept user define
  defineResponseHelper(joi) {
    // return {
    //   success: {
    //     schema: joi.object(),
    //     handler() {}
    //   },
    //   failed: {
    //     schema: joi.object(),
    //     handler() {}
    //   }
    // }
  }
  listen() {
    this.use(router.routes());
    super.listen.apply(this, arguments);
  }
}

handleRoutes(Application, router);
