module.exports = {
  'env': {
    'browser': true,
    'commonjs': true,
    'es2021': true,
  },
  'extends':['google','plugin:jsdoc/recommended'],
  'overrides': [
  ],
  'parserOptions': {
    'ecmaVersion': 'latest',
  },
  'rules': {
    'max-len': ["error", { "code": 400 }]
  },
  "plugins": [
    "jsdoc"
  ],
};
