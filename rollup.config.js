import resolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'
import babel from 'rollup-plugin-babel'
import pkg from './package.json'

export default [
	{
		input: pkg.source,
		external: ['ms'],
		output: [
			{ file: pkg.main, format: 'cjs' },
			{ file: pkg.browser, format: 'umd' }
		],
		name: 'frecent',
		plugins: [
			resolve(),
			commonjs(),
			babel({
				exclude: 'node_modules/**'
			})
		]
	},
	{
		input: pkg.source,
		external: ['ms'],
		output: [
			{ file: pkg.module, format: 'es' }
		],
		name: 'frecent',
		plugins: [
			resolve(),
			commonjs()
		]
	}
]
