import { createApp } from '@eryue/core';
import config from '@config';
import { log } from '@megvii-scripts/utils';

const app = createApp(config);

// modules controler, modle, module

// controler: class User extends Controler {
//   constructor() {
//     super();
//   }
//   list() {
//     this.$logger.info('1');
//     this.$jwt.sign('data');
//     this.ctx.body = 'res';
//   }
// }

// module: class UserModule extends Module {
//   constructor() {
//     super();
//     this.prefix = 'api/user' || 'user';
//   }
//   [GET]: {
//     'info/list': this.$user.list
//   }
//   [POST]: {

//   }
// };
 
// app.service.jwt.sign/verify => $jwt
// app.service.logger => $logger
// app context => request

// app.use(middleware);
// app.module(UserModule);
// app.service({
//   logger: new Log4j()
// })

app
.listen(3000, '0.0.0.0', () => {
  log.info(`server listening at port: 3000`);
});