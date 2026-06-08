import nextVitals from "eslint-config-next/core-web-vitals";

const eslintConfig = [
  ...nextVitals,
  {
    rules: {
      "import/no-anonymous-default-export": "off",
      "react-hooks/component-hook-factories": "off",
      "react-hooks/error-boundaries": "off",
      "react-hooks/refs": "off",
      "react-hooks/set-state-in-effect": "off",
      "react-hooks/static-components": "off",
      "react-hooks/use-memo": "off",
    },
  },
  {
    ignores: [
      ".planning/**",
      ".next/**",
      "out/**",
      "tmp/**",
      "private/**",
      "node_modules/**",
      "tsconfig.tsbuildinfo",
    ],
  },
];

export default eslintConfig;
