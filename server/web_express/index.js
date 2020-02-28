require('@babel/polyfill');
require('@babel/register')({
  presets: ['@babel/env'],
  plugins: ['babel-plugin-root-import']
});
require('./app.js');
