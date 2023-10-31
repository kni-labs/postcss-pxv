const valueParser = require('postcss-value-parser');

module.exports = () => {
  return {
    postcssPlugin: 'postcss-pxv',
    Once(root) {
      root.walkDecls((decl) => {
        const isShorthand = /^(margin|padding)$/.test(decl.prop); // Check if the property is a shorthand property like margin
        const basis = 'var(--siteBasis)';
        const max = 'var(--siteMax)';
        const min = '1px';
        
        const convertValue = (value) => {
          const parsedValue = valueParser(value);

          parsedValue.walk((node) => {
            if (node.type === 'word' && /^[0-9.-]+pxv$/i.test(node.value)) {
              const pxvValue = parseFloat(node.value.replace('pxv', ''));
  
              if (pxvValue >= 0) {
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

        if (isShorthand) {
          // Split the shorthand value into individual components. Could potentially be problematic if there are any shorthand values that mix pxv and other values that have spaces like calc, but we'll cross that bridge when we come to it.
          const components = decl.value.split(' ');
          // Process each component and rejoin the processed components back into the shorthand value
          decl.value = components.map((component) => convertValue(component)).join(' ');
        } else {
          // For non-shorthand properties, process the value as before
          decl.value = convertValue(decl.value);
        }
      });
    },
  };
};

module.exports.postcss = true;