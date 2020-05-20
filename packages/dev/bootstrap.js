import Eryue from '@eryue/core';
import { log } from '@megvii-scripts/utils';

const app = new Eryue();
app.on('error', err => {
  console.log('app.error', err);
});
app.use(/^\/info/, async (cx, next) => {
  // if (!cx.query.token) {
  //   cx.failed(403);
  // } else {
    console.log('access request');
    await next();
  // }
});
// modules controler, modle, module
class Logger {
  constructor(app) {
    this.app = app;
  }
  info() {
    console.log('info', this.app.env);
  }
  getName() {
    return 'logger' + this.app.env;
  }
}
function infoList(cx) {
  // this.$logger.info('1');
  // this.$jwt.sign('data');
  // cx.service.logger.info();
  // console.log(cx.model.User.list());
  // const token = cx.jwt.verify('ass');
  // console.log(token);
  // cx.query
  // cx.request.body
  // cx.params
  // cx.$cookies('abc', '123', {
  //   maxAge: 1111111
  // });
  // cx.throw(401, 'gg');
  // cx.success(cx.jwt.sign({name: 'hh'}));
  // if (cx.query.q) {
  //   return cx.$logger.getName() + ' ' + cx.$User.list();
  // }
  // return new BadRequestException();
  cx.success({
    env: process.env.NODE_ENV,
    configPath: process.env.ERYUE_CONFIG_PATH,
    config: app.config
  });
}

app
.get({
  '/info/list': infoList,
  '/l': cx => {
    cx.success(cx.jwt.verify(cx.query.q, 'secret'));
  }
});

// app.service.jwt.sign/verify => $jwt
// app.service.logger => $logger
// app context => request
// app.use(middleware);
app.service({
  logger: Logger
});
app.model({
  user: {
    list() {
      return 'list';
    }
  }
});
// app.helper({
  // x
// });

app
.listen(3000, '0.0.0.0', () => {
  log.info(`server listening at port: 3000`, process.env.NODE_ENV);
});
