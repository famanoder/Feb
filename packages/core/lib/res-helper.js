import joi from '@hapi/joi';
import { httpException } from './exception';
import { getArgType, log } from './util';

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
      }
      return body;
    }
  }
}

export function responseHelper(app) {
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
      log.error(error, 'schema');
      body = error;
      code = 500;
    }
    this.status = code;
    this.body = body;
  }

  app.context.failed = function (code, res) {
    if (!res && !getArgType(code).isNumber) {
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
      log.error(error, 'schema');
      body = error;
    }
    this.status = code;
    this.body = body;
  }
}

