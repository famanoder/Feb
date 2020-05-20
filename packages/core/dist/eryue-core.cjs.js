'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var Koa = _interopDefault(require('koa'));
var KoaRouter = _interopDefault(require('koa-router'));
var jsonwebtoken = _interopDefault(require('jsonwebtoken'));
var utils = require('@iuv-tools/utils');
var joi = _interopDefault(require('@hapi/joi'));
var Jasypt = _interopDefault(require('@eryue/jasypt'));

function jwt(app) {
	const { secret = 'secret', expire = 60 * 10 } = app.config.jwt || {};
  app.context.jwt = {
    sign(data, opts) {
      const token = jsonwebtoken.sign(data, secret, Object.assign({
        expiresIn: expire
      }, opts));
      return token;
    },
    verify(token) {
      const res = {
        error: null,
        token: null,
        isExpired: false,
        isInvalid: false
      };
      try {
        res.token = jsonwebtoken.verify(token, secret);
      } catch (e) {
        res.error = e.name;
        res.isExpired = e.name === 'TokenExpiredError';
        res.isInvalid = e.name === 'JsonWebTokenError';
      }
      return res;
    }
  };
}

function handleRoutes(application, router) {
  const handleRoute = function (method, uri, handler) {
    router[method].apply(router, [uri, async (cx, next) => {
      handler.call(router, cx);
    }]);
  }
  ;['get', 'post', 'put', 'head', 'patch', 'options', 'delete', 'del', 'all'].forEach(method => {
    application.prototype[method] = function (uri, handler) {
      if (!handler && utils.getArgType(uri).isObject) {
        Object.keys(uri).forEach(item => {
          handleRoute(method, item, uri[item]);
        });
      } else {
        handleRoute(method, uri, handler);
      }
      return this;
    };
  });
}

const httpException = {
  400: 'bad request exception',
  401: 'unauthorized exception',
  403: 'forbidden exception',
  404: 'not found exception',
  406: 'not acceptable exception',
  408: 'request timeout exception',
  409: 'conflict exception',
  410: 'gone exception',
  413: 'payload too large exception',
  415: 'unsupported media type exception',
  422: 'unprocessable exception',
  500: 'internal server error exception',
  501: 'not implemented exception',
  502: 'bad gateway exception',
  503: 'service unavailable exception',
  504: 'gateway timeout exception'
};

const helperSchema = joi.object({
                schema: joi.object().required(),
                handler: joi.function().required()
              }).required();
const responseHelperSchema = joi.object({
  success: helperSchema,
  failed: helperSchema
});
const defaultResponseHelper = {
  success: {
    schema: joi.object({
      success: joi.boolean().required(),
      result: joi.any()
    }),
    handler(res) {
      const body = {
        success: true,
        result: res
      };
      return body;
    }
  },
  failed: {
    schema: joi.object({
      success: joi.boolean().required(),
      result: joi.any()
    }),
    handler(res) {
      const body = {
        success: false,
        result: res
      };
      return body;
    }
  }
};

function responseHelper(app) {
  let responseHelper = app.defineResponseHelper.call(app, joi);

  if (responseHelper) {
    const { error } = responseHelperSchema.validate(responseHelper);
    if (error) {
      throw new Error(error);
    }
  } else {
    responseHelper = defaultResponseHelper;
  }
  
  app.context.success = function (code, res) {
    if (arguments.length === 1) {
      res = code;
      code = 200;
    }
    const { handler, schema } = defaultResponseHelper.success;
    let body = handler(res);
    const { error } = schema.validate(body);
    
    if (error) {
      utils.log.error(error, 'schema');
      body = error;
      code = 500;
    }
    this.status = code;
    this.body = body;
  };

  app.context.failed = function (code, res) {
    if (!res && !utils.getArgType(code).isNumber) {
      res = code;
      code = 500;
    }
    if (!res) {
      res = httpException[code] || null;
    } 
    const { handler, schema } = defaultResponseHelper.failed;
    let body = handler(res);
    const { error } = schema.validate(body);
    
    if (error) {
      utils.log.error(error, 'schema');
      body = error;
    }
    this.status = code;
    this.body = body;
  };
}

async function cookiesMiddleware(cx, next) {
  // {
  //   keys,
  //   option: {
  //   }
  // }
  let { cookies } = cx.app.config;
  const cookiesArguments = joi.object({
    0: joi.string().required(),
    1: [
      joi.string(),
      joi.number(),
      joi.boolean()
    ],
    2: joi.any()
  });

  if (utils.getArgType(cookies).isObject) {
    if (!utils.getArgType(cookies.option).isObject) {
      cookies.option = {};
    }
    if (utils.getArgType(cookies.keys).isArray) {
      cx.app.keys = cookies.keys;
      cookies.option.signed = true;
    }
  } else {
    cookies = {
      keys: ['secret'],
      option: {
        signed: true,
        httpOnly: true
      }
    };
    cx.app.keys = cookies.keys;
  }

  cx.$cookies = function(key, value, option) {
    const { error } = cookiesArguments.validate(arguments);
    if (error) {
      throw new Error(error);
    }
    if (arguments.length === 3) {
      return cx.cookies.set(key, value, Object.assign(cookies.option, option));
    }
    if (arguments.length === 2) {
      return cx.cookies.set(key, value, cookies.option);
    }
    if (arguments.length === 1) {
      return cx.cookies.get(key, cookies.option);
    }
  };

  await next();
}

async function errorMiddleware(cx, next) {
  try {
    await next();
  } catch (e) {
    utils.log.error(e.stack, 'middleware');
    cx.failed(500);
  }
}

const cookiesSchema = joi.object({
  keys: joi.array(),
  option: joi.object({
    maxAge: joi.number(),
    signed: joi.boolean(),
    expires: joi.date(),
    path: joi.string(),
    domain: joi.string(),
    secure: joi.boolean(),
    httpOnly: joi.boolean(),
    overwrite: joi.boolean()
  })
});

const jwtSchema = joi.object({
  algorithm: joi.string(),
  expiresIn: joi.string(),
  notBefore: joi.string(),
  audience: [
    joi.string(),
    joi.array()
  ],
  subject: joi.string(),
  issuer: joi.string(),
  jwtid: joi.string(),
  mutatePayload: joi.boolean(),
  noTimestamp: joi.boolean(),
  header: joi.object(),
  encoding: joi.string()
});

const configSchema = joi.object({
  cookies: cookiesSchema,
  jwt: jwtSchema,
  name: joi.string()
});

function validateConfig(config) {
  return configSchema.validate(config || {});
}

function configResolver() {
  const configPath = process.env.ERYUE_CONFIG_PATH;

  try {
    const config = require(configPath);
    const { error } = validateConfig(config);
    if (error) {
      utils.log.error(error, 'config');
      process.exit(1);
    }
    const jasyptPass = process.env.ERYUE_JASYPT;
    if (jasyptPass) {
      const jasypt = new Jasypt();
      jasypt.setPassword(jasyptPass);
      jasypt.decryptConfig(config);
    }
    return config;
  } catch (e) {
    utils.log.error(e, 'config');
    utils.log.error('please make sure the config file exists.', 'config');
    process.exit(1);
  }
}

const router = new KoaRouter();

class Application extends Koa {
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
      if (!middleware && utils.getArgType(condition).isFunction) {
        middleware = condition;
        condition = false;
      }
      if (middleware && utils.getArgType(middleware).isFunction) {
        if (condition) {
          const conditionType = utils.getArgType(condition);
          if (conditionType.isString) {
            isUsable = condition === url;
          } else if (conditionType.isRegExp) {
            isUsable = condition.test(url);
          } else if (conditionType.isArray) {
            isUsable = condition.some(item => {
              const itemType = utils.getArgType(item);
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
    };

    // inner middleware
    const _middleware = async (cx, next) => {
      const isUsable = usable(cx);
      if (isUsable) {
        await middleware(cx, next);
      } else {
        await next();
      }
    };

    super.use(_middleware);
    return this;
  }
  /**
   * @param {object} services 注册的service的key/value对象
   * @returns {object} this
   */
  service(services) {
    // 数据操作
    if (utils.getArgType(services).isObject) {
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
    if (utils.getArgType(models).isObject) {
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

module.exports = Application;
