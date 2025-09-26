const valueParser = require('postcss-value-parser');

module.exports = () => {
  return {
    postcssPlugin: 'postcss-pxv',
    Once(root) {
      root.walkDecls((decl) => {
        const basis = 'var(--siteBasis)';
        const max = 'var(--siteMax)';
        const min = 'var(--siteMin, 1px)'; // ✅ dynamic floor with fallback

        const convertValue = (value) => {
          const parsedValue = valueParser(value);

          parsedValue.walk((node) => {
            if (node.type === 'word' && /^[0-9.-]+pxv$/i.test(node.value)) {
              const pxvValue = parseFloat(node.value.replace('pxv', ''));

              if (pxvValue === 0) {
                node.value = '0';
              } else if (pxvValue > 0) {
                node.value = `clamp(${min}, calc(${pxvValue}vw * (100 / ${basis})), calc(${pxvValue}px * ${max} / ${basis}))`;
              } else {
                const absPxvValue = Math.abs(pxvValue);
                node.value = `clamp(calc(-${absPxvValue} * (100 / ${basis}) * 1vw), calc(-${absPxvValue}px * ${max} / ${basis}), -${min})`;
              }
            }
          });

          return parsedValue.toString();
        };

        decl.value = convertValue(decl.value);
      });
    },
  };
};

module.exports.postcss = true;
