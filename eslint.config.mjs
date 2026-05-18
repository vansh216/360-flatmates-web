import tseslint from "typescript-eslint";
import reactHooks from "eslint-plugin-react-hooks";
import react from "eslint-plugin-react";

const eslintConfig = tseslint.config(
  ...tseslint.configs.recommended,
  {
    plugins: {
      "react-hooks": reactHooks,
      react,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "react-hooks/exhaustive-deps": "warn",
      "react/react-in-jsx-scope": "off",
    }
  },
  {
    ignores: [
      "dist/**",
      "node_modules/**",
      ".agents/**",
      ".claude/**",
      ".factory/**",
      "playwright-report/**",
      "test-results/**",
      "src/lib/api/openapi-types.ts",
      "tsconfig.tsbuildinfo"
    ]
  },
  {
    rules: {
      "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-empty-object-type": "off",
      "@typescript-eslint/no-redundant-type-constituents": "off",
      "@typescript-eslint/no-namespace": "off",
    }
  }
);

export default eslintConfig;
