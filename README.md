# Dainte

Painless testing for Svelte components.

## Usage

### `dainte.compile`

```js
result: {
    // Compiled Svelte component class
    Component,

    // JSDom window and document for mounting the component.
    window,
    document,

    // Alias to component as specified or inferred name
    [name],
} = await dainte.compile(source: string, options?: {...})
```

The following options can be passed to `compile`, including [svelte.compile options](https://svelte.dev/docs#svelte_compile).
The `dev` option defaults to `true` for testing. None are required:

| option       | default                 | description                                                      |
|:-------------|:------------------------|:-----------------------------------------------------------------|
| `name`       | `'Component'`           | Name of the component class, inferred from filename              |
| `dev`        | `true`                  | Perform runtime checks and provide debugging information         |
| `immutable`  | `false`                 | You promise not to mutate any objects                            |
| `hydratable` | `false`                 | Enables the hydrate: true runtime option                         |
| `legacy`     | `false`                 | Generates code that will work in IE9 and IE10                    |
| `accessors`  | `false`                 | Getters and setters will be created for the component's props    |
| `css`        | `true`                  | Include CSS styles in JS class                                   |
| `inspect`    | `false`                 | Include `instance.inspect()` accessor                            |
| `plugins`    | `[svelte(), resolve()]` | Advanced option to manually specify Rollup plugins for bundling. |

#### Example

```js
import { compile } from 'dainte'

const { App, document } = await compile('./App.svelte')

const app = new App({
    target: document.body,
})
```

### `dainte.mount`

```js
result: {
    // Component instance
    instance,

    // Compiled JS component class
    Component,

    // JSDom window and document where component is mounted.
    window,
    document,

    // Alias to the Component with specified or inferred name
    [name],

    // Alias to the instance with lowercase specified or inferred name
    [lowercase(name)],
}  = await mount(source: string, options?: {...})
```

All `compile` options can also be passed to `mount`. Additionally, these options, including the [component initialisation options](https://svelte.dev/docs#Creating_a_component), can be provided:

| option       | default                 | description                                                      |
|:-------------|:------------------------|:-----------------------------------------------------------------|
| `html`       | `'<body></body>'`       | HTML to initiate the JSDom instance with                         |
| `target`     | `'body'`                | Render target (as a query selector, *not a DOM element* as in Svelte initialisation) |
| `anchor`     | `null`                  | Render anchor (as a query selector, *not a DOM element* as in Svelte initialisation) |
| `props`      | `{}`                    | An object of properties to supply to the component               |
| `hydrate`    | `false`                 | Upgrade existing DOM instead of replacing it                     |
| `intro`      | `false`                 | Play transitions on initial render                               |

A `svelte.tick` is awaited between mounting the instance and resolving the `mount` promise so
that the DOM is full initialized. An additional `svelte.tick` should be awaited
between updating the component and reading from the DOM.

#### Example

```js
import { mount } from 'dainte'
import { tick } from 'svelte'

const { app, document } = await mount('./App.svelte')
app.$set({ answer: 42 })
await tick()

expect(document.querySelector('#answer').textContent).toBe('42')
```

### `instance.inspect`

```js
variables: {
    // Snapshot of all top-level variables and imports
} = instance.inspect()
```

Compiling with `inspect: true` adds a `inspect()` function to the component instance.
Calling the function returns a snapshot object of all top-level variables and their
current values. Snapshot values are not reactive and `inspect()` must be called
again to retrieve updated values.

#### Example

```js
import { mount } from 'dainte'

const { app } = await mount('./App.svelte', { inspect: true })
const { answer } = app.inspect()
// 42
```

## Roadmap

- [ ] SSR testing
