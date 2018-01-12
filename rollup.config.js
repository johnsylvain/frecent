import resolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'
import pkg from './package.json'

export default {
	input: pkg.source,
	external: ['ms'],
	output: [
		{ file: pkg.main, format: 'cjs' },
		{ file: pkg.module, format: 'es' },
		{ file: pkg.browser, format: 'umd' }
	],
	name: 'frecent',
	plugins: [
		resolve(),
		commonjs()
	]
}
