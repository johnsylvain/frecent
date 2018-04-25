import resolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'
import typescript from 'rollup-plugin-typescript'
import pkg from './package.json'

export default {
	input: pkg.source,
	external: ['ms'],
	output: [
		{ file: pkg.main, format: 'cjs' },
		{ file: pkg.browser, format: 'umd' },
		{ file: pkg.browser, format: 'es' }
	],
	name: 'frecent',
	plugins: [
		resolve(),
		typescript(),
		commonjs()
	]
}
