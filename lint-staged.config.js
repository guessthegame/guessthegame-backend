module.exports = {
  // Run type-check on changes to TypeScript files
  '**/*.ts': () => 'yarn type-check',
  // Run tests
  // '**/*.(ts|.json)': () => 'yarn test',
  // Format files and check eslint rules for TypeScript and JavaScript files
  '**/*.(ts|js)': (filenames) => [
    `yarn eslint --fix ${filenames.join(' ')}`,
    `yarn prettier --write ${filenames.join(' ')}`,
  ],
}
