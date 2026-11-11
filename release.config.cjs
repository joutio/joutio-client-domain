/**
 * Profil npm partagé (joutio-reusable-workflows) + publication sur GitHub Packages : contrairement aux apps,
 * ce paquet est publié (`npmPublish: true`, registre de `publishConfig`, jeton `NPM_TOKEN`).
 */
module.exports = {
  branches: ['main'],
  plugins: [
    ['@semantic-release/commit-analyzer', { preset: 'conventionalcommits' }],
    ['@semantic-release/release-notes-generator', { preset: 'conventionalcommits' }],
    '@semantic-release/changelog',
    ['@semantic-release/npm', { npmPublish: true }],
    ['@semantic-release/git', { assets: ['CHANGELOG.md', 'package.json', 'package-lock.json'], message: 'chore(release): ${nextRelease.version} [skip ci]' }],
    '@semantic-release/github',
  ],
}
