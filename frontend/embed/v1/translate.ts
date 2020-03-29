const _ = require('lodash');
_.templateSettings.interpolate = /{{([\s\S]+?)}}/g;

const fs = require('fs');
const translations = require('./src/translations.json');

const getOutputPath = (lng: String): String => `./build/index.${lng}.html`;

const createLocalizedTemplate = (html: string, lng: String, translations: Object): void => {
  const path = getOutputPath(lng);
  const compiled = _.template(html);
  const compiledHTML = compiled(translations);

  fs.writeFile(path, compiledHTML, (err: Error) => {
    if (err) return console.log(err);
    console.log(`Created localized index file > ${path}`);
  });
};

fs.readFile('./build/index.html', (err: Error, data: Buffer) => {
  if (err) throw err;

  Object.keys(translations).map(lng => createLocalizedTemplate(data.toString(), lng, translations[lng]));
});

export {};
