import js from '@eslint/js'
import tseslint from 'typescript-eslint'

/** Garde-fous de l'ADR 0001 : aucun framework, aucune API de plateforme. */
export default tseslint.config(
  { ignores: ['dist', '*.cjs'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['src/**/*.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            { group: ['react', 'react-*', 'react/*', 'react-native', 'react-native/*', 'expo', 'expo-*', 'vite', 'next', 'next/*'], message: 'Domaine pur : aucun framework (ADR 0001).' },
            { group: ['@/*'], message: "Domaine autonome : aucun alias d'application." },
          ],
        },
      ],
      'no-restricted-globals': ['error', 'window', 'document', 'localStorage', 'sessionStorage', 'fetch', 'navigator', 'WebSocket'],
    },
  },
)
