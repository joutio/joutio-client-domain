import { describe, expect, it } from 'vitest'
import { descriptionsDraft, topicDescription } from './description.js'

describe('topicDescription', () => {
  it('reads the requested language, then French', () => {
    const topic = { description: 'Français', descriptions: { fr: 'Français', en: 'English' } }
    expect(topicDescription(topic, 'en')).toBe('English')
    expect(topicDescription(topic, 'fr')).toBe('Français')
    expect(topicDescription({ description: 'Français', descriptions: { fr: 'Français' } }, 'en')).toBe('Français')
  })

  it('falls back to the legacy field and ignores blanks', () => {
    expect(topicDescription({ description: 'Ancienne' }, 'en')).toBe('Ancienne')
    expect(topicDescription({ description: '  ' }, 'fr')).toBeNull()
    expect(topicDescription({ description: null }, 'fr')).toBeNull()
  })

  it('prepares one draft per language', () => {
    expect(descriptionsDraft({ description: 'Ancienne' })).toEqual({ fr: 'Ancienne', en: '' })
    expect(descriptionsDraft({ description: 'Fr', descriptions: { fr: 'Fr', en: 'En' } })).toEqual({ fr: 'Fr', en: 'En' })
  })
})
