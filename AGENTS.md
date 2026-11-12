# AGENTS.md — joutio-client-domain

> Domaine client **partagé** de Joutio : TypeScript pur, consommé par `joutio-web` et `joutio-mobile`.
> Décision : ADR [`design/specs/decisions/0001-client-domain.md`](../../design/specs/decisions/0001-client-domain.md),
> lancé le 2026-11-11 (D17, [`design/specs/web-kit.md`](../../design/specs/web-kit.md) § 2).

---

## 1. Rôle

Ce que les deux apps calculaient chacune de leur côté, une seule fois et testé :

| Module (`@joutio/client-domain/<module>`) | Contenu |
|---|---|
| `game` | constantes du duel, read model `GameState`, fold des notifications, chronologie de l'arène (`sceneAt`), DTOs de résultat |
| `rooms` | salles (`Room`, fold, étapes de préparation, cadence des relances) et matchmaking (`Matchmaking`, fold) |
| `authoring` | atelier : rôles, actions sur une question, brouillons, plan de modifications, signalements, plafonds |
| `profile` | règles du pseudonyme (caractères, longueur, clé d'unicité), miroir de `joutio-profile` |
| `api-types` | DTOs de façade du BFF (`*View`, `*Request`) et erreur RFC 7807 (`ApiError`) |

L'entrée racine `@joutio/client-domain` réexporte tout.

Origine : `joutio-mobile` (`features/{duel,play,authoring}/domain/`, `shared/types/{bff,api}.ts`), extrait le 2026-11-11.

---

## 2. Règles (ADR 0001)

- **Aucun framework ni plateforme** : pas de `react`, `react-native`, `expo`, `vite`, `next` ; pas de `window`,
  `document`, `fetch`, `localStorage`, `navigator`, `WebSocket`. ESLint l'interdit (`eslint.config.js`).
- `lib: ["ES2023"]`, sans DOM ; tests Vitest en environnement `node`.
- Fonctions pures et types. Pas d'I/O, pas d'horloge implicite : l'instant courant est un paramètre (`now`).
- Le serveur reste autoritaire (score, Elo, XP) : le client projette et affiche.
- Codes sémantiques (`OR`, `SCIENCE`) ; jamais de couleur ni de valeur de design (elles sont dans les tokens du lab).
- Imports relatifs avec l'extension `.js` (résolution `NodeNext`) : le paquet se charge dans Node comme dans un bundler.
- Un contrat du BFF qui change se reporte ici **avant** les apps, puis les apps montent de version.

---

## 3. Commandes

```bash
npm install
npm run typecheck
npm run lint
npm test
npm run build      # dist/ : ESM + .d.ts
```

---

## 4. Publication

- **semantic-release** à chaque push sur `main` (hors `*.md`), config `release.config.cjs` : profil npm partagé, avec
  publication sur **GitHub Packages** (`publishConfig.registry`). Commits conventionnels : `feat` → mineure,
  `fix`/`perf` → correctif, `!` → majeure. **Ne jamais changer la version à la main.**
- Jeton : `JOUTIO_GITHUB_TOKEN` s'il existe, sinon le `GITHUB_TOKEN` du workflow (`packages: write`).
- Les apps pinnent une version release. Installation : `.npmrc` avec `@joutio:registry=https://npm.pkg.github.com`
  et un jeton qui lit les paquets (`read:packages`), en local (`~/.npmrc`) comme en CI (`NODE_AUTH_TOKEN`).
- Commits sans ligne de co-auteur.
