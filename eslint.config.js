import js from "@eslint/js";
import tseslint from "typescript-eslint";
import prettier from "eslint-config-prettier";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default [
  // Ignore non-source files (and this config)
  { ignores: ["dist/**", "node_modules/**", "coverage/**", "eslint.config.js"] },

  // Base JS rules
  js.configs.recommended,

  // --- Typed TypeScript rules ONLY for src/**
  ...tseslint.configs.recommendedTypeChecked.map((cfg) => ({
    ...cfg,
    files: ["src/**/*.ts"],
    languageOptions: {
      ...(cfg.languageOptions ?? {}),
      parserOptions: {
        ...(cfg.languageOptions?.parserOptions ?? {}),
        project: ["./tsconfig.eslint.json"],
        tsconfigRootDir: __dirname,
      },
    },
  })),

  // --- Untyped TypeScript rules for tests/**
  // (avoids ‘error typed value’ cascades in test files)
  ...tseslint.configs.recommended.map((cfg) => ({
    ...cfg,
    files: ["tests/**/*.ts"],
  })),

  // Project-wide tweaks
  {
    files: ["**/*.{ts,js}"],
    rules: {
      "no-console": "off",
      // Fastify plugin fns often don't await; keep the noise down:
      "@typescript-eslint/require-await": "off",
    },
  },

  // Let Prettier handle formatting
  prettier,
];
