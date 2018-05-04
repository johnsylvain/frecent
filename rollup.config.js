import typescript from 'rollup-plugin-typescript';
import pkg from './package.json';

export default {
  input: pkg.source,
  output: [
    { file: pkg.main, format: 'cjs' },
    { file: pkg.browser, format: 'umd' },
    { file: pkg.browser, format: 'es' }
  ],
  name: 'frecent',
  plugins: [typescript()]
};
