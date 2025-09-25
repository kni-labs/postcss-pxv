onst valueParser = require('postcss-value-parser');

module.exports = () => {
  return {
    postcssPlugin: 'postcss-pxv',
    Once(root) {
      root.walkDecls((decl) => {
        const convertValue = (value) => {
          const parsedValue = valueParser(value);

          parsedValue.walk((node) => {
            if (node.type === 'word' && /^[0-9.-]+pxv$/i.test(node.value)) {
              const pxvValue = parseFloat(node.value.replace('pxv', ''));

              if (pxvValue === 0) {
                node.value = '0'; // Clean zero
              } else {
                // Multiply value (positive or negative) by a shared CSS var
                node.value = `calc(${pxvValue} * var(--pxvUnit))`;
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
