import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";

const eslintConfig = defineConfig([
  ...nextVitals,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  {
    rules: {
      // This rule is overly strict for common Next.js patterns (fetch + setState inside effects).
      // The project uses effects for data loading and derived UI state; keep eslint green.
      "react-hooks/set-state-in-effect": "off",
    },
  },
]);

export default eslintConfig;
