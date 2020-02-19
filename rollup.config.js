import pkg from './package.json'

export default {
    input: 'src/index.js',
    output: [
        {
            file: pkg.main,
            format: 'cjs',
            sourcemap: true,
        },
        {
            file: pkg.module,
            format: 'es',
            sourcemap: true,
        },
    ],
    external: [
        'path',
        'rollup',
        'rollup-plugin-svelte',
        '@rollup/plugin-node-resolve',
        'jsdom',
        'svelte',
        'svelte/compiler',
        'code-red',
    ],
}
