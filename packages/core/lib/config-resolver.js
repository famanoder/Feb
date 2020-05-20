import joi from '@hapi/joi';
import Jasypt from '@eryue/jasypt';
import { log } from './util';

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

export function configResolver() {
  const configPath = process.env.ERYUE_CONFIG_PATH;

  try {
    const config = require(configPath);
    const { error } = validateConfig(config);
    if (error) {
      log.error(error, 'config');
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
    log.error(e, 'config');
    log.error('please make sure the config file exists.', 'config');
    process.exit(1);
  }
}