const postcss = require('postcss');
const valueParser = require('postcss-value-parser');

module.exports = (opts = {}) => {
  return {
    postcssPlugin: 'postcss-pxv',
    Once(root, { result }) {
      root.walkDecls((decl) => {
        const propertyName = decl.prop;

        // Check if the property is a shorthand property like margin
        const isShorthand = /^(margin|padding|border|border-(top|right|bottom|left))$/.test(propertyName);

        if (isShorthand) {
          // Split the shorthand value into individual components
          const components = decl.value.split(' ');

          // Process each component
          components.forEach((component, index) => {
            const parsedValue = valueParser(component);
            const basis = 'var(--siteBasis)';
            const max = 'var(--siteMax)';
            const min = '1px';

            parsedValue.walk((node) => {
              if (node.type === 'word' && /^[0-9.-]+pxv$/i.test(node.value)) {
                const pxvValue = parseFloat(node.value.replace('pxv', ''));

                if (pxvValue >= 0) {
                  node.value = `clamp(${min}, calc(${pxvValue}vw * (100 / ${basis})), calc(${pxvValue}px * ${max} / ${basis}))`;
                } else {
                  const absPxvValue = Math.abs(pxvValue);
                  node.value = `clamp(calc(${absPxvValue} * (100 / ${basis}) * -1vw), calc(${absPxvValue} * (100 / ${basis}) * -1vw), -1px)`;
                }
              }
            });

            // Replace the component in the shorthand value
            components[index] = parsedValue.toString();
          });

          // Rejoin the processed components back into the shorthand value
          decl.value = components.join(' ');
        } else {
          // For non-shorthand properties, process the value as before
          const parsedValue = valueParser(decl.value);

          parsedValue.walk((node) => {
            if (node.type === 'word' && /^[0-9.-]+pxv$/i.test(node.value)) {
              const pxvValue = parseFloat(node.value.replace('pxv', ''));

              const basis = 'var(--siteBasis)';
              const max = 'var(--siteMax)';
              const min = '1px';

              if (pxvValue >= 0) {
                node.value = `clamp(${min}, calc(${pxvValue}vw * (100 / ${basis})), calc(${pxvValue}px * ${max} / ${basis}))`;
              } else {
                const absPxvValue = Math.abs(pxvValue);
                node.value = `clamp(calc(${absPxvValue} * (100 / ${basis}) * -1vw), calc(${absPxvValue} * (100 / ${basis}) * -1vw), -1px)`;
                // still needs "large" value tweak
              }
            }
          });

          decl.value = parsedValue.toString();
        }
      });
    },
  };
};

module.exports.postcss = true;