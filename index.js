const valueParser = require('postcss-value-parser');

module.exports = () => {
  const pxvRegex = /^-?\d*\.?\d+pxv$/i;

  return {
    postcssPlugin: 'postcss-pxv',

    Declaration(decl) {
      if (!decl.value.toLowerCase().includes('pxv')) return;

      const parsed = valueParser(decl.value);
      let changed = false;

      parsed.walk((node) => {
        if (node.type === 'word' && pxvRegex.test(node.value)) {
          const num = node.value.slice(0, -3);
          
          node.value = Number(num) === 0 
            ? '0' 
            : `calc(${num} * var(--pxv-unit))`;
          
          changed = true;
        }
      });

      if (changed) {
        decl.value = parsed.toString();
      }
    },
  };
};

module.exports.postcss = true;