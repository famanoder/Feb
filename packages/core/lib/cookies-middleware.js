import joi from '@hapi/joi';
import { getArgType } from './util';

export async function cookiesMiddleware(cx, next) {
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

  if (getArgType(cookies).isObject) {
    if (!getArgType(cookies.option).isObject) {
      cookies.option = {};
    }
    if (getArgType(cookies.keys).isArray) {
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
    }
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
  }

  await next();
}