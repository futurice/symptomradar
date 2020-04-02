const _ = require('lodash');
_.templateSettings.interpolate = /{{([\s\S]+?)}}/g;

const fs = require('fs');
const translations = require('../src/frontend/embed/v1/translations.json');

const getOutputPath = (lng: String): String => `${__dirname}/../build/index.${lng}.html`;

const createLocalizedTemplate = (html: string, lng: String, translations: Object): void => {
  const path = getOutputPath(lng);
  const compiled = _.template(html);
  const compiledHTML = compiled(translations);

  fs.writeFile(path, compiledHTML, (err: Error) => {
    if (err) return console.log(err);
    console.log(`Created localized index file > ${path}`);
  });
};

fs.readFile(`${__dirname}/../build/index.html`, (err: Error, data: Buffer) => {
  if (err) throw err;

  Object.keys(translations).map(lng => createLocalizedTemplate(data.toString(), lng, translations[lng]));
});

export {};
