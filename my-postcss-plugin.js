
const postcss = require('postcss');
const valueParser = require('postcss-value-parser');

module.exports = postcss.plugin('postcss-vp', () => {
  return {
    postcssPlugin: 'postcss-vp',
    Declaration(decl) {
      const value = decl.value;
      const parsedValue = valueParser(value);

      parsedValue.walk((node) => {
        if (node.type === 'word' && /^[0-9-]+vp$/i.test(node.value)) {
          const vpValue = parseInt(node.value.replace('vp', ''));
          const basis = 'var(--siteBasis)';
          const max = 'var(--siteMax)';
          const min = '1px';

          if (vpValue >= 0) {
            node.value = `clamp(${min}, calc(${vpValue}vw * (100 / ${basis})), calc(${vpValue}vw * ${max} / ${basis}))`;
          } else {
            const absVpValue = Math.abs(vpValue);
            node.value = `clamp(calc(${absVpValue} * (100 / ${basis}) * -1vw), calc(${absVpValue} * (100 / ${basis}) * -1vw), -1px) `;
          }
        }
      });

      decl.value = parsedValue.toString();
    },
  };
});

module.exports.postcss = true;