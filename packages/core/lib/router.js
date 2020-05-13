import { Exception } from './exception';
import { getArgType } from '@iuv-tools/utils';

export function handleRoutes(application, router) {
  const handleRoute = function (method, uri, handler) {
    router[method].apply(router, [uri, async (cx, next) => {
      const res = await handler.call(router, cx);
      if (res instanceof Exception) {
        const  { message, code, stack } = res;
        cx.body = message;
        cx.status = code;
        console.log(stack);
        return;
      } else if (getArgType(res).isObject) {
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
      if (!handler && getArgType(uri).isObject) {
        Object.keys(uri).forEach(item => {
          handleRoute(method, item, uri[item]);
        });
      } else {
        handleRoute(method, uri, handler);
      }
      return this;
    }
  });
}