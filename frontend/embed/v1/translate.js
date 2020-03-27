const _ = require('lodash');
_.templateSettings.interpolate = /{{([\s\S]+?)}}/g;

const fs = require('fs');
const translations = require('./src/translations.json');

const defaultLanguage = 'fi';

const getTemplatePath = lng => (defaultLanguage === lng ? `./public/index.html` : `./public/index.${lng}.html`);

const createLocalizedTemplate = (html, lng, translations) => {
  const path = getTemplatePath(lng);
  const compiled = _.template(html);
  const compiledHTML = compiled(translations);

  fs.writeFile(path, compiledHTML, err => {
    if (err) return console.log(err);
    console.log(`Created localized index file > ${path}`);
  });
};

fs.readFile('./public/index.template.html', (err, data) => {
  if (err) throw err;

  Object.keys(translations).map(lng => createLocalizedTemplate(data.toString(), lng, translations[lng]));
});
