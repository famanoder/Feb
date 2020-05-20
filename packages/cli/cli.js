#!/usr/bin/env node

const path = require('path');
const execa = require('execa');
const joi = require('@hapi/joi');
const { log } = require('@iuv-tools/utils');

const {
  _: commands,
  ...argv
} = require('yargs-parser')(
  process.argv.slice(2),
  {
    alias: {
      entry: 'e',
      mode: 'm',
      config: 'c'
    }
  }
);

const command = commands[0];
const optionSchema = joi.object({
  entry: joi.string(),
  mode: joi.string(),
  config: joi.string(),
  encryptedConfig: [joi.string(), joi.number()],
  e: joi.string(),
  m: joi.string(),
  c: joi.string()
});

if (command === 'start') {
  start(argv);
}

function presetEnvConfig(option) {
  const { error } = optionSchema.validate(option);
  if (error) {
    log.error(error, 'eryue-scripts');
    process.exit(1);
  }
  if (!option.mode) {
    option.mode = 'dev';
  }
  if (!option.config) {
    option.config = `./config.${option.mode}.js`;
  }
  const eryueConfigPath = path.resolve(process.cwd(), option.config);
  return {
    NODE_ENV: option.mode,
    ERYUE_CONFIG_PATH: eryueConfigPath,
    ERYUE_JASYPT: option.encryptedConfig,
    FORCE_COLOR: true
  }
}

function start(option = {}) {
  const env = presetEnvConfig(option);
  const starter = execa('node', [option.entry || './www/start'], { env });
  starter.stdout.pipe(process.stdout);
  starter.stderr.pipe(process.stderr);
}