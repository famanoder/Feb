const { resolve } = require('path');

module.exports = {
  presets: [
    ['@babel/preset-env', {
      'targets': {
        'node': 'current'
      },
      'modules': 'commonjs'
    }]
  ],
  plugins: [
    [
      'module-resolver',
      {
        alias: {
          '@app': resolve('src'),
          '@config': resolve('config.js')
        }
      }
    ]
  ]
}