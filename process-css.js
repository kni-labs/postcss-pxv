const fs = require('fs');
const postcss = require('postcss');
const myPlugin = require('./index');

const css = fs.readFileSync('input.css', 'utf8');

postcss([myPlugin])
  .process(css, { from: 'input.css' })
  .then((result) => {
    fs.writeFileSync('output.css', result.css);
  });