import { log } from './util';

export async function errorMiddleware(cx, next) {
  try {
    await next();
  } catch (e) {
    log.error(e.stack, 'middleware');
    cx.failed(500);
  }
}