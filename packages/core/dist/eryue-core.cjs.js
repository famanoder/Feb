'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var Koa = _interopDefault(require('koa'));
var KoaRouter = _interopDefault(require('koa-router'));
var utils = require('@iuv-tools/utils');
var joi = _interopDefault(require('@hapi/joi'));

const EXCEPTION = Symbol('http:exception');

class Exception extends Error {
  constructor(code, msg) {
    super(...arguments);
    this.name = EXCEPTION;
    this.code = code;
    this.message = msg;
    this.stack = (new Error()).stack;
  }
}

class BadRequestException extends Exception {
  constructor(msg) {
    super(400, msg || '[400] bad request exception');
  }
}

class UnauthorizedException extends Exception {
  constructor(msg) {
    super(401, msg || '[401] unauthorized exception');
  }
}

class ForbiddenException extends Exception {
  constructor(msg) {
    super(403, msg || '[403] forbidden exception');
  }
}

class NotFoundException extends Exception {
  constructor(msg) {
    super(404, msg || '[404] not found exception');
  }
}

class NotAcceptableException extends Exception {
  constructor(msg) {
    super(406, msg || '[406] not acceptable exception');
  }
}

class RequestTimeoutException extends Exception {
  constructor(msg) {
    super(408, msg || '[408] request timeout exception');
  }
}

class ConflictException extends Exception {
  constructor(msg) {
    super(409, msg || '[409] conflict exception');
  }
}

class GoneException extends Exception {
  constructor(msg) {
    super(410, msg || '[410] gone exception');
  }
}

class PayloadTooLargeException extends Exception {
  constructor(msg) {
    super(413, msg || '[413] payload too large exception');
  }
}

class UnsupportedMediaTypeException extends Exception {
  constructor(msg) {
    super(415, msg || '[415] unsupported media type exception');
  }
}

class UnprocessableException extends Exception {
  constructor(msg) {
    super(415, msg || '[415] unprocessable exception');
  }
}

class InternalServerErrorException extends Exception {
  constructor(msg) {
    super(500, msg || '[500] internal server error exception');
  }
}

class NotImplementedException extends Exception {
  constructor(msg) {
    super(501, msg || '[501] not implemented exception');
  }
}

class BadGatewayException extends Exception {
  constructor(msg) {
    super(502, msg || '[502] bad gateway exception');
  }
}

class ServiceUnavailableException extends Exception {
  constructor(msg) {
    super(503, msg || '[503] service unavailable exception');
  }
}

class GatewayTimeoutException extends Exception {
  constructor(msg) {
    super(504, msg || '[504] gateway timeout exception');
  }
}

function handleRoutes(application, router) {
  const handleRoute = function (method, uri, handler) {
    router[method].apply(router, [uri, async (cx, next) => {
      const res = await handler.call(router, cx);
      if (res instanceof Exception) {
        const  { message, code, stack } = res;
        cx.body = message;
        cx.status = code;
        console.log(stack);
        return;
      } else if (utils.getArgType(res).isObject) {
        // cx.success/failed
        // {}
        const { statusCode, body } = res;
        cx.status = statusCode;
        cx.body = body;
      } else {
        cx.status = 200;
        cx.body = res;
      }
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
      result: joi.required()
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
      result: joi.required()
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
    const { value, error } = responseHelperSchema.validate(responseHelper);
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
    const { value, error } = schema.validate(body);
    
    if (error) {
      utils.log.error(error, 'schema');
      res = error;
      code = 500;
    } else {
      res = body;
    }
    return {
      statusCode: code,
      body: res
    };
  };

  app.context.failed = function (code, res) {
    if (arguments.length === 1) {
      res = code;
      code = 500;
    }
    const { handler, schema } = defaultResponseHelper.failed;
    let body = handler(res);
    const { value, error } = schema.validate(body);
    
    if (error) {
      utils.log.error(error, 'schema');
      res = error;
    } else {
      res = body;
    }
    return {
      statusCode: code,
      body: res
    };
  };
}

const router = new KoaRouter();

class Application extends Koa {
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

exports.BadGatewayException = BadGatewayException;
exports.BadRequestException = BadRequestException;
exports.ConflictException = ConflictException;
exports.EXCEPTION = EXCEPTION;
exports.Exception = Exception;
exports.ForbiddenException = ForbiddenException;
exports.GatewayTimeoutException = GatewayTimeoutException;
exports.GoneException = GoneException;
exports.InternalServerErrorException = InternalServerErrorException;
exports.NotAcceptableException = NotAcceptableException;
exports.NotFoundException = NotFoundException;
exports.NotImplementedException = NotImplementedException;
exports.PayloadTooLargeException = PayloadTooLargeException;
exports.RequestTimeoutException = RequestTimeoutException;
exports.ServiceUnavailableException = ServiceUnavailableException;
exports.UnauthorizedException = UnauthorizedException;
exports.UnprocessableException = UnprocessableException;
exports.UnsupportedMediaTypeException = UnsupportedMediaTypeException;
exports.default = Application;
