// @ts-check
import tseslint from 'typescript-eslint';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import sonarjs from 'eslint-plugin-sonarjs';
import astro from 'eslint-plugin-astro';

const complexityRules = {
  complexity: ['error', 10],
  'max-depth': ['error', 3],
  'max-params': ['error', 4],
  'max-statements': ['error', 15],
  'max-nested-callbacks': ['error', 3],
  'max-lines-per-function': ['error', { max: 60, skipBlankLines: true, skipComments: true }],
  'no-restricted-syntax': [
    'error',
    {
      selector: "ExportNamedDeclaration > VariableDeclaration[kind='let']",
      message: 'Avoid global mutable state: exported `let` bindings leak shared, reassignable state across modules. Encapsulate it in a function, class, or module-local closure instead.',
    },
  ],
};

export default tseslint.config(
  {
    ignores: ['dist/**', '.astro/**', 'node_modules/**', 'design-system/components/bundle.js'],
  },

  tseslint.configs.recommendedTypeChecked,
  sonarjs.configs.recommended,

  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      ...complexityRules,
      '@typescript-eslint/consistent-type-assertions': [
        'error',
        { assertionStyle: 'never' },
      ],
      '@typescript-eslint/no-non-null-assertion': 'error',
    },
  },

  {
    files: ['**/*.tsx'],
    plugins: { react, 'react-hooks': reactHooks },
    languageOptions: {
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    settings: { react: { version: 'detect' } },
    rules: {
      ...react.configs.flat.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      'react/no-unstable-nested-components': ['error', { allowAsProps: false }],
      'react/jsx-no-constructed-context-values': 'error',
      'react/no-this-in-sfc': 'error',
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
    },
  },

  ...astro.configs.recommended,
  {
    files: ['**/*.astro'],
    rules: {
      ...complexityRules,
    },
  },

  {
    files: ['scripts/**/*.mjs', 'tests/**/*.mjs', 'e2e/**/*.mjs', '*.config.mjs', '*.config.ts'],
    ...tseslint.configs.disableTypeChecked,
  },

  {
    // Spawns our own build/test tooling (npm, astro, playwright) by name — a fixed,
    // trusted command set, not attacker-influenced input, so PATH resolution is fine here.
    files: ['scripts/**/*.mjs', 'tests/**/*.mjs', 'e2e/**/*.mjs'],
    rules: {
      'sonarjs/no-os-command-from-path': 'off',
    },
  },

  {
    // Astro's content loader ships its own zod alongside the project's zod dependency;
    // the duplicate type identities make every `z.*` call read as using a "different",
    // deprecated zod to the type checker. False positive, not a real deprecation.
    files: ['src/content.config.ts'],
    rules: {
      'sonarjs/deprecation': 'off',
    },
  },

  {
    // Pre-existing library internals: `h = window.React.createElement` glue with
    // no live DOM to type JSX calls against, plus glyph regex matching and prop
    // type defs. The flagged any/unsafe/regex/ternary/non-null patterns are
    // working and exercised by every page that renders a Chip or icon — not
    // rewriting them under a new lint pass without dedicated visual regression
    // coverage first. (The sample pages in `src/pages/` are real consumers of
    // this library and hold to the full ruleset with no exemptions.)
    files: [
      'design-system/components/index.d.ts',
      'design-system/components/src/index.tsx',
    ],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/consistent-type-assertions': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
      'sonarjs/no-redundant-optional': 'off',
      'sonarjs/redundant-type-aliases': 'off',
      'sonarjs/no-nested-conditional': 'off',
      'sonarjs/regex-complexity': 'off',
      'sonarjs/super-linear-regex': 'off',
    },
  },
);
