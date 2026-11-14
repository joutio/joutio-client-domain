import { describe, expect, it } from 'vitest'
import { buildShareUrl, displayShareUrl, parseShareUrl } from './index.js'

describe('share links', () => {
  it('builds universal links', () => {
    expect(buildShareUrl({ kind: 'profile', id: 'Sofia_R' })).toBe('https://go.joutio.com/p/Sofia_R')
    expect(buildShareUrl({ kind: 'room', id: 'x7k2' })).toBe('https://go.joutio.com/j/x7k2')
    expect(displayShareUrl('https://go.joutio.com/t/abc')).toBe('go.joutio.com/t/abc')
  })

  it('parses universal links, legacy room links and app paths', () => {
    expect(parseShareUrl('https://go.joutio.com/p/Sofia_R')).toEqual({ kind: 'profile', id: 'Sofia_R' })
    expect(parseShareUrl('/t/rois-de-france')).toEqual({ kind: 'topic', id: 'rois-de-france' })
    expect(parseShareUrl('https://joutio.com/join/x7k2')).toEqual({ kind: 'room', id: 'x7k2' })
    expect(parseShareUrl('joutio://join/x7k2')).toEqual({ kind: 'room', id: 'x7k2' })
    expect(parseShareUrl('https://joutio.com/join/?room=x7k2')).toEqual({ kind: 'room', id: 'x7k2' })
    expect(parseShareUrl('https://go.joutio.com/i/NADJ7K')).toBeNull()
    expect(parseShareUrl('https://joutio.com/faq')).toBeNull()
  })
})
