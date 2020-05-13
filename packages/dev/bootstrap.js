import Eryue, { BadRequestException } from '@eryue/core';
import config from '@config';
import { log } from '@megvii-scripts/utils';

const app = new Eryue(config);

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
  cx.service.logger.info();
  console.log(cx.model.User.list());

  // cx.query
  // cx.request.body
  // cx.params
  return cx.failed({
    a: [1],
    b: {a: 1}
  });
  // if (cx.query.q) {
  //   return cx.$logger.getName() + ' ' + cx.$User.list();
  // }
  // return new BadRequestException();
}

app
.get({
  '/info/list': infoList,
  '/l': cx => cx.path
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
  log.info(`server listening at port: 3000`);
});
