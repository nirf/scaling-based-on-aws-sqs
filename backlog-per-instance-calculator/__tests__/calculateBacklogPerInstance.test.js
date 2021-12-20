import {getBacklogPerInstance} from '../src/handlers/calculateBacklogPerInstance'

test('sanity', () => {
    const res = getBacklogPerInstance(0, 0, 10)
    expect(res).toBe(0)
})