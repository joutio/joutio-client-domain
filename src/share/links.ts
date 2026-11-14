/**
 * Liens universels de partage (`design/specs/screens/partage.md` § 2) : `go.joutio.com/{p|t|j}/{id}`.
 * Ouverts par l'app installée (Universal Links, App Links), sinon par la page du BFF qui redirige vers le store ou
 * le web. Les anciens liens de salon (`joutio.com/join/{id}`, `joutio://join/{id}`) restent reconnus.
 */
export const SHARE_ORIGIN = 'https://go.joutio.com'

export type ShareKind = 'profile' | 'topic' | 'room'

export const SHARE_PREFIX: Record<ShareKind, string> = { profile: 'p', topic: 't', room: 'j' }

const KIND_BY_PREFIX: Record<string, ShareKind> = { p: 'profile', t: 'topic', j: 'room' }

export interface ShareTarget {
  kind: ShareKind
  /** Identifiant du joueur, du sujet ou du salon. */
  id: string
}

export function buildShareUrl({ kind, id }: ShareTarget, origin = SHARE_ORIGIN): string {
  return `${origin.replace(/\/$/, '')}/${SHARE_PREFIX[kind]}/${encodeURIComponent(id)}`
}

/** Lien sans protocole, pour l'affichage (`go.joutio.com/p/sofia_r`). */
export const displayShareUrl = (url: string) => url.replace(/^https?:\/\//, '')

/**
 * Cible d'un lien entrant : lien universel, ancien lien de salon ou schéma de l'app. `null` pour tout autre lien.
 * Accepte une URL complète ou un chemin (`/p/sofia_r`, tel que le routeur de l'app le reçoit).
 */
export function parseShareUrl(input: string): ShareTarget | null {
  const match = /^(?:[a-z][a-z0-9+.-]*:\/\/[^/?#]*)?\/*([^?#]*)(?:\?([^#]*))?/i.exec(input.trim())
  if (!match) return null
  const scheme = /^([a-z][a-z0-9+.-]*):\/\/([^/?#]*)/i.exec(input.trim())
  // `joutio://join/x7k2` : l'hôte de l'URL est le premier segment du chemin.
  const segments = [scheme && scheme[1].toLowerCase() === 'joutio' ? scheme[2] : '', ...(match[1] ?? '').split('/')].filter(Boolean)
  const params = new URLSearchParamsLite(match[2] ?? '')
  if (segments.length === 2) {
    const [head, id] = segments as [string, string]
    const kind = KIND_BY_PREFIX[head] ?? (head === 'join' ? 'room' : undefined)
    if (kind && id) return { kind, id: decodeURIComponent(id) }
  }
  // Page de la landing : `/join/?room={id}`.
  const room = params.get('room')
  if (segments.length === 1 && segments[0] === 'join' && room) return { kind: 'room', id: room }
  return null
}

/** Lecture minimale d'une query string, sans dépendre de `URLSearchParams` (absent de certains moteurs JS). */
class URLSearchParamsLite {
  private readonly values = new Map<string, string>()

  constructor(query: string) {
    for (const pair of query.split('&')) {
      if (!pair) continue
      const [key, value = ''] = pair.split('=')
      if (key && !this.values.has(key)) this.values.set(decodeURIComponent(key), decodeURIComponent(value.replace(/\+/g, ' ')))
    }
  }

  get(key: string): string | null {
    return this.values.get(key) ?? null
  }
}
