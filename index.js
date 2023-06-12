
const postcss = require('postcss');
const valueParser = require('postcss-value-parser');

module.exports = postcss.plugin('postcss-pxv', () => {
  return {
    postcssPlugin: 'postcss-pxv',
    Declaration(decl) {
      const value = decl.value;
      const parsedValue = valueParser(value);

      parsedValue.walk((node) => {
        if (node.type === 'word' && /^[0-9-]+pxv$/i.test(node.value)) {
          const pxvValue = parseInt(node.value.replace('pxv', ''));
          const basis = 'var(--siteBasis)';
          const max = 'var(--siteMax)';
          const min = '1px';

          if (pxvValue >= 0) {
            node.value = `clamp(${min}, calc(${pxvValue}vw * (100 / ${basis})), calc(${pxvValue}px * ${max} / ${basis}))`;
          } else {
            const absPxvValue = Math.abs(pxvValue);
            node.value = `clamp(calc(${absPxvValue} * (100 / ${basis}) * -1vw), calc(${absPxvValue} * (100 / ${basis}) * -1vw), -1px) `;
            // still needs "large" value tweak
          }
        }
      });

      decl.value = parsedValue.toString();
    },
  };
});

module.exports.postcss = true;