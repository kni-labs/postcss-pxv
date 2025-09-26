const valueParser = require('postcss-value-parser');
const postcss = require('postcss');

module.exports = () => {
  return {
    postcssPlugin: 'postcss-pxv',
    Once(root) {
      // Inject defaults if no :root present
      const hasRoot = root.nodes.some(
        (node) => node.type === 'rule' && node.selector === ':root'
      );

      if (!hasRoot) {
        const rootRule = postcss.rule({ selector: ':root' });
        rootRule.append({ prop: '--siteBasis', value: '375' });
        rootRule.append({ prop: '--siteMax', value: '600' });
        rootRule.append({
          prop: '--pxvUnit',
          value:
            'clamp(0px, calc((100 / var(--siteBasis)) * 1vw), calc(1px * var(--siteMax) / var(--siteBasis)))',
        });
        root.prepend(rootRule);
      }

      // Shorthands that need full expansion
      const shorthandProps = new Set([
        'border',
        'border-top',
        'border-right',
        'border-bottom',
        'border-left',
        'outline',
      ]);

      root.walkDecls((decl) => {
        const basis = 'var(--siteBasis)';
        const max = 'var(--siteMax)';
        const min = '0px';

        const convertValue = (value) => {
          const parsedValue = valueParser(value);

          parsedValue.walk((node) => {
            if (node.type === 'word' && /^[0-9.-]+pxv$/i.test(node.value)) {
              const pxvValue = parseFloat(node.value.replace('pxv', ''));

              if (pxvValue === 0) {
                node.value = '0';
              } else if (shorthandProps.has(decl.prop)) {
                // Inline full clamp for border/outline
                if (pxvValue > 0) {
                  node.value = `clamp(${min}, calc(${pxvValue}vw * (100 / ${basis})), calc(${pxvValue}px * ${max} / ${basis}))`;
                } else {
                  const absPxvValue = Math.abs(pxvValue);
                  node.value = `clamp(calc(-${absPxvValue} * (100 / ${basis}) * 1vw), calc(-${absPxvValue}px * ${max} / ${basis}), -${min})`;
                }
              } else {
                // Default compact form
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
