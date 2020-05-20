import { getArgType } from './util';

export function handleRoutes(application, router) {
  const handleRoute = function (method, uri, handler) {
    router[method].apply(router, [uri, async (cx, next) => {
      handler.call(router, cx);
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