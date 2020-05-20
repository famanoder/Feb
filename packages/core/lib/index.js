import Koa from 'koa';
import KoaRouter from 'koa-router';
import { jwt } from './jwt';
import { getArgType, log } from './util';
import { handleRoutes } from './router';
import { responseHelper } from './res-helper';
import { cookiesMiddleware } from './cookies-middleware';
import { errorMiddleware } from './error-middleware';
import { configResolver } from './config-resolver';

const router = new KoaRouter();

export default class Application extends Koa {
  constructor() {
    super();

    const config = configResolver();
    
    this.config = config;
    this.context.parent = this;
    this.context.config = config;
    this.context.service = Object.create(null);
    this.context.model = Object.create(null);

    jwt(this);
    responseHelper(this);

    this.middleware.push(cookiesMiddleware);
    this.middleware.push(errorMiddleware);
  }
  /**
   * 可过滤的中间件
   * @param {string | regexp | array<string | regexp>} condition 过滤条件
   * @param {function} middleware 中间件
   */
  use(condition, middleware) {
    const usable = cx => {
      const url = cx.url;
      let isUsable = true;
      if (!middleware && getArgType(condition).isFunction) {
        middleware = condition;
        condition = false;
      }
      if (middleware && getArgType(middleware).isFunction) {
        if (condition) {
          const conditionType = getArgType(condition);
          if (conditionType.isString) {
            isUsable = condition === url;
          } else if (conditionType.isRegExp) {
            isUsable = condition.test(url);
          } else if (conditionType.isArray) {
            isUsable = condition.some(item => {
              const itemType = getArgType(item);
              return itemType.isString ?
                      item === url :
                        itemType.isRegExp ?
                        item.test(url) :
                        false;
            });
          } else {
            isUsable = true;
          }
        } else {
          isUsable = true;
        }
      }
      return isUsable;
    }

    // inner middleware
    const _middleware = async (cx, next) => {
      const isUsable = usable(cx);
      if (isUsable) {
        await middleware(cx, next);
      } else {
        await next();
      }
    }

    super.use(_middleware);
    return this;
  }
  /**
   * @param {object} services 注册的service的key/value对象
   * @returns {object} this
   */
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
    return this;
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
    return this;
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
