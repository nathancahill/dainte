import path from 'path'
import { rollup } from 'rollup'
import rollupSvelte from 'rollup-plugin-svelte'
import resolve from '@rollup/plugin-node-resolve'
import { JSDOM } from 'jsdom'
import { tick } from 'svelte'
import { compile as svelteCompile } from 'svelte/compiler'
import { print, b } from 'code-red'

const sanitize = input =>
    path
        .basename(input)
        .replace(path.extname(input), '')
        .replace(/[^a-zA-Z_$0-9]+/g, '_')
        .replace(/^_/, '')
        .replace(/_$/, '')
        .replace(/^(\d)/, '_$1')

const capitalize = str => str[0].toUpperCase() + str.slice(1)
const lowercase = str => str[0].toLowerCase() + str.slice(1)

const roll = async (
    source,
    {
        name: providedName = null,
        plugins = null,
        dev = true,
        immutable = false,
        hydratable = false,
        legacy = false,
        accessors = false,
        css = true,
        inspect = false,
    } = {},
) => {
    const bundle = await rollup({
        input: source,
        plugins: plugins || [
            rollupSvelte({
                dev,
                immutable,
                hydratable,
                legacy,
                accessors: accessors || inspect,
                css,
                preprocess: {
                    script: input => {
                        if (inspect) {
                            const ast = svelteCompile(
                                `<script>${input.content}</script>`,
                            )

                            const scope = {
                                type: 'ObjectExpression',
                                properties: ast.vars.map(variable => ({
                                    type: 'Property',
                                    key: {
                                        type: 'Identifier',
                                        name: variable.name,
                                    },
                                    value: {
                                        type: 'Identifier',
                                        name: variable.name,
                                    },
                                })),
                            }

                            const func = print(
                                b`export const inspect = () => (${scope})`,
                            )

                            return { code: `${input.content}\n${func.code}` }
                        }

                        return { code: input.content }
                    },
                },
            }),
            resolve(),
        ],
    })

    const { output } = await bundle.generate({
        format: 'iife',
        name: providedName,
    })

    return output[0].code
}

export const compile = async (
    source,
    {
        name: providedName = null,
        plugins = null,
        dev = true,
        immutable = false,
        hydratable = false,
        legacy = false,
        accessors = false,
        css = true,
        inspect = false,
        html = '<body></body>',
    } = {},
) => {
    const name = providedName || capitalize(sanitize(source))

    const code = await roll(source, {
        name,
        plugins,
        dev,
        immutable,
        hydratable,
        legacy,
        accessors,
        css,
        inspect,
        html,
    })

    // eslint-disable-next-line no-new-func
    const Component = new Function(`${code}return ${name};`)()

    return {
        Component,
        [name]: Component,
    }
}

export const mount = async (
    source,
    {
        name: providedName,
        plugins = null,
        dev = true,
        immutable = false,
        hydratable = false,
        legacy = false,
        accessors = false,
        css = true,
        inspect = false,

        html = '<body></body>',
        target = 'body',
        anchor = null,
        props = {},
        hydrate = false,
        intro = false,
    } = {},
) => {
    const name = providedName || capitalize(sanitize(source))

    const code = await roll(source, {
        name,
        plugins,
        dev,
        immutable,
        hydratable,
        legacy,
        accessors,
        css,
        inspect,
        html,
    })

    const { window } = new JSDOM(html, { runScripts: 'dangerously' })
    const { document } = window

    const script = document.createElement('script')
    script.type = 'text/javascript'
    script.text = code
    document.body.appendChild(script)

    const Component = window[name]

    const instance = new Component({
        target: document.querySelector(target),
        anchor: anchor ? document.querySelector(anchor) : null,
        props,
        hydrate,
        intro,
    })

    await tick()

    return {
        window,
        document,
        Component,
        instance,
        [name]: Component,
        [lowercase(name)]: instance,
    }
}

export const render = async (
    source,
    {
        dev = true,
        immutable = false,
        hydratable = false,
        css = true,
        preserveComments = false,
        preserveWhitespace = false,

        plugins = null,
        props = {},
    } = {},
) => {
    const bundle = await rollup({
        input: source,
        plugins: plugins || [
            rollupSvelte({
                generate: 'ssr',
                dev,
                immutable,
                hydratable,
                css,
                preserveComments,
                preserveWhitespace,
            }),
            resolve(),
        ],
    })

    const name = 'Component'

    const { output } = await bundle.generate({
        format: 'iife',
        name,
    })

    // eslint-disable-next-line no-new-func
    const Component = new Function(`${output[0].code}return ${name};`)()

    return Component.render(props)
}
