import { fileURLToPath } from "node:url";
import path from "node:path";
import js from "@eslint/js";
import { FlatCompat } from "@eslint/eslintrc";
import tseslint from "typescript-eslint";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Resolve Next.js's eslint presets relative to apps/web, where `next` and
// `eslint-config-next` are actually installed — keeps that dependency out
// of the root package.json for workspaces that aren't Next apps.
const nextCompat = new FlatCompat({ baseDirectory: path.join(__dirname, "apps/web") });

export default tseslint.config(
  {
    ignores: [
      "**/.next/**",
      "**/dist/**",
      "**/build/**",
      "**/node_modules/**",
      "**/.turbo/**",
      "**/coverage/**",
      "**/next-env.d.ts",
      "supabase/functions/**",
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    rules: {
      "no-console": ["warn", { allow: ["warn", "error"] }],
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/no-explicit-any": "warn",
    },
  },
  // Next.js-specific rules (React, hooks, Core Web Vitals), scoped to the
  // one Next.js app in the monorepo. Shared packages don't need them.
  ...nextCompat.extends("next/core-web-vitals", "next/typescript").map((config) => ({
    ...config,
    files: ["apps/web/**/*.{ts,tsx,js,jsx}"],
  })),
);
