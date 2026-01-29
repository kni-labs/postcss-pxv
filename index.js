const valueParser = require('postcss-value-parser');

/**
 * PostCSS PXV (Viewport Pixel)
 * Converts '10pxv' shorthand into 'calc(10 * var(--pxv-unit))'.
 * Converts '0pxv' to '0'.
 */
module.exports = (opts = {}) => {
  const unitVar = opts.unitVar || '--pxv-unit';
  const pxvRegex = /^-?\d*\.?\d+pxv$/i;

  return {
    postcssPlugin: 'postcss-pxv',

    Declaration(decl) {
      // Fast guard: skip declarations without the unit
      if (!decl.value.toLowerCase().includes('pxv')) return;

      const parsed = valueParser(decl.value);
      let changed = false;

      parsed.walk((node) => {
        if (node.type === 'word' && pxvRegex.test(node.value)) {
          const num = node.value.slice(0, -3);
          
          // Complex Calc 0 would work, but lets be polite
          node.value = Number(num) === 0 
            ? '0' 
            : `calc(${num} * var(${unitVar}))`;
          
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