module.exports = {
  env: {
    es6: true,
    browser: true,
    node: true,
  },
  parser: 'babel-eslint',
  parserOptions: {
    sourceType: 'module',
    ecmaVersion: 9,
    ecmaFeatures: {
      jsx: true,
      modules: true,
      experimentalObjectRestSpread: true,
    },
  },
  extends: "airbnb",
  ignorePatterns: [
    "/config/",
    "node_modules/"
  ],
  rules: {
    "indent": ["error", 2], // A custom style-related rule for example
    "comma-dangle": [1, "always-multiline"],
    "react/jsx-filename-extension": "off",
    "react/require-default": "off",
    "react/forbid-prop-types": "off",
    "object-curly-newline": "off",
    "react/jsx-boolean-value": "off",
    "react/state-in-constructor": "off",
    "react/destructuring-assignment": "off",
    "react/require-default-props": "off",
    "react/jsx-props-no-spreading": "off",
    "react/button-has-type": "off",
    "react/sort-comp": "off",
    "max-len": ["error", { "code":120 }],
    "no-restricted-globals": "off",
    "import/prefer-default-export": "off",
    "new-cap": "off",
    "no-plusplus": "off",
    "no-use-before-define": "off",
    "no-unused-vars": [
      "error",
      {
        varsIgnorePattern: "React"
      }
    ],
    "no-param-reassign": "off",
    "max-classes-per-file": "off",
  }
}