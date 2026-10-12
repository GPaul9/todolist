// eslint.config.js
import { defineConfig } from "eslint/config";
import tsParser from "@typescript-eslint/parser";
import tsPlugin from "@typescript-eslint/eslint-plugin";
import reactPlugin from "eslint-plugin-react";
import reactHooksPlugin from "eslint-plugin-react-hooks";
import importPlugin from "eslint-plugin-import";
import jsxA11yPlugin from "eslint-plugin-jsx-a11y";
import prettierPlugin from "eslint-plugin-prettier";
import reactRefreshPlugin from "eslint-plugin-react-refresh";
import boundariesPlugin from "eslint-plugin-boundaries";
import globals from "globals";

export default defineConfig([
  {
    // глобальные настройки для всех файлов
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        ecmaFeatures: { jsx: true },
        project: "./tsconfig.json",
      },
      globals: {
        ...globals.browser,
        ...globals.node,
        es2021: "readonly",
      },
    },
    plugins: {
      "@typescript-eslint": tsPlugin,
      react: reactPlugin,
      "react-hooks": reactHooksPlugin,
      import: importPlugin,
      "jsx-a11y": jsxA11yPlugin,
      prettier: prettierPlugin,
      "react-refresh": reactRefreshPlugin,
      boundaries: boundariesPlugin,
    },
    rules: {
      // Prettier как ошибка
      "prettier/prettier": "error",

      // React
      "react/react-in-jsx-scope": "off",
      "react/prop-types": "off",

      // TypeScript
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_" },
      ],

      // Импорты
      "import/order": [
        "warn",
        {
          groups: [
            "builtin",
            "external",
            "internal",
            "parent",
            "sibling",
            "index",
          ],
          "newlines-between": "always",
          alphabetize: {
            order: "asc",
            caseInsensitive: true,
          },
        },
      ],

      "import/no-unresolved": "error",
      "import/no-duplicates": "error",

      // React Hooks
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",

      // React Refresh (Vite)
      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true },
      ],

      // Общий стиль
      "no-console": "warn",
    },
    settings: {
      react: { version: "detect" },
      "import/resolver": { typescript: {} },
    },
  },
  {
    // файлы/папки, которые нужно игнорировать
    ignores: ["dist", "node_modules", "email-letters"],
  },
]);
