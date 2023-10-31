const valueParser = require('postcss-value-parser');

module.exports = () => {
  return {
    postcssPlugin: 'postcss-pxv',
    Once(root) {
      root.walkDecls((decl) => {
        const basis = 'var(--siteBasis)';
        const max = 'var(--siteMax)';
        const min = '1px';
        
        const convertValue = (value) => {
          const parsedValue = valueParser(value);

          parsedValue.walk((node) => {
            if (node.type === 'word' && /^[0-9.-]+pxv$/i.test(node.value)) {
              const pxvValue = parseFloat(node.value.replace('pxv', ''));
  
              if (pxvValue === 0) {
                node.value = 0;
              } else if (pxvValue > 0) {
                node.value = `clamp(${min}, calc(${pxvValue}vw * (100 / ${basis})), calc(${pxvValue}px * ${max} / ${basis}))`;
              } else {
                const absPxvValue = Math.abs(pxvValue);
                node.value = `clamp(calc(${absPxvValue} * (100 / ${basis}) * -1vw), calc(${absPxvValue} * (100 / ${basis}) * -1vw), -1px)`;
                // still needs "large" value tweak
              }
            }
          });

          return parsedValue.toString();
        };

        decl.value = decl.value.split(' ').map((component) => convertValue(component)).join(' ');
      });
    },
  };
};

module.exports.postcss = true;