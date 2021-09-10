const { join } = require('path');
const { copyFileSync } = require('fs');

const source = join(__dirname, 'airtable.js');

[
  'createRecipe',
  'editRecipe',
  'deleteRecipe',
  'getRecipe',
  'getRecipes',
].forEach(folder => {
  const target = join(__dirname, 'src', folder, 'airtable.js');
  copyFileSync(source, target);
});
