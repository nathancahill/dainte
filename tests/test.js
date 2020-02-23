import { tick } from 'svelte'
import { mount, compile, render } from '../src'

test('compile', async () => {
    const { Dom } = await compile('./tests/fixtures/Dom.svelte')

    expect(Dom).toBeInstanceOf(Function)
})

test('mount', async () => {
    const { document } = await mount('./tests/fixtures/Dom.svelte', {
        props: {
            answer: 42,
        },
    })

    expect(document.getElementById('answer').textContent).toBe('42')
})

test('inspect', async () => {
    const { dom } = await mount('./tests/fixtures/Dom.svelte', {
        props: {
            answer: 42,
        },
        inspect: true,
    })

    const { answer } = dom.inspect()

    expect(answer).toBe(42)
})

test('update', async () => {
    const { dom, document } = await mount('./tests/fixtures/Dom.svelte', {
        props: {
            answer: 42,
        },
        accessors: true,
    })

    expect(document.getElementById('answer').textContent).toBe('42')

    dom.$set({ answer: 40 })
    await tick()

    expect(document.getElementById('answer').textContent).toBe('40')
})

test('render', async () => {
    const { head, html, css } = await render('./tests/fixtures/Dom.svelte', {
        props: {
            answer: 42,
        },
    })

    expect(head).toBe('')
    expect(html).toBe('<div id="answer">42</div>')
    expect(css).toMatchObject({ code: '', map: null })
})
