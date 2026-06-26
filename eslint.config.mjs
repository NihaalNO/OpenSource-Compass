import js from "@eslint/js";
import tseslint from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";

export default [
  {
    ignores: ["**/node_modules/**", "**/dist/**", "**/.next/**", "**/coverage/**", "**/*.d.ts"]
  },
  js.configs.recommended,
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaFeatures: {
          jsx: true
        },
        ecmaVersion: "latest",
        sourceType: "module"
      },
      globals: {
        console: "readonly",
        process: "readonly",
        Buffer: "readonly",
        React: "readonly",
        Request: "readonly",
        RequestInit: "readonly",
        Response: "readonly",
        Headers: "readonly",
        fetch: "readonly",
        window: "readonly",
        document: "readonly",
        setTimeout: "readonly",
        clearTimeout: "readonly"
      }
    },
    plugins: {
      "@typescript-eslint": tseslint
    },
    rules: {
      ...tseslint.configs.recommended.rules
    }
  }
];
