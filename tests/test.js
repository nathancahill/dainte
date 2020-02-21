import { tick } from 'svelte'
import { mount, compile } from '../src'

test('compile', async () => {
    const { Dom, document } = await compile('./tests/fixtures/Dom.svelte')

    // eslint-disable-next-line no-new
    new Dom({
        target: document.body,
        props: {
            answer: 42,
        },
    })

    await tick()

    expect(document.getElementById('answer').textContent).toBe('42')
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
