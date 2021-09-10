const fs = require('fs/promises');
const { createWriteStream } = require('fs');
const { join } = require('path');
const archiver = require('archiver');

/**
 * @param {string} source
 * @param {string} out
 * @returns {Promise}
 */
function zipDirectory(source, out) {
  const archive = archiver('zip', { zlib: { level: 9 }});
  const stream = createWriteStream(out);

  return new Promise((resolve, reject) => {
    archive
      .directory(source, false)
      .on('error', reject)
      .pipe(stream)
    ;

    stream.on('close', resolve);
    archive.finalize();
  });
}

const lambdas = [
  'createRecipe',
  'editRecipe',
  'deleteRecipe',
  'getRecipe',
  'getRecipes',
];

(async () => {
  const airtableSource = join(__dirname, 'airtable.js');
  const build = join(__dirname, 'build');
  await fs.mkdir(build, { recursive: true });
  try {
    for (const lambdaName of lambdas) {
      const lambdaFolder = join(__dirname, 'src', lambdaName);
      const airtableTarget = join(lambdaFolder, 'airtable.js');
      await fs.copyFile(airtableSource, airtableTarget);
      await zipDirectory(
        lambdaFolder,
        join(build, `${lambdaName}.zip`),
      );
    }
  } catch (err) {
    console.error(err);
  }
})();
