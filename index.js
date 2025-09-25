const valueParser = require('postcss-value-parser');
const postcss = require('postcss');

module.exports = () => {
  return {
    postcssPlugin: 'postcss-pxv',
    Once(root) {
      //
      // 1. Inject defaults if no :root found
      //
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

      //
      // 2. Convert pxv values
      //
      root.walkDecls((decl) => {
        const convertValue = (value) => {
          const parsedValue = valueParser(value);

          parsedValue.walk((node) => {
            if (node.type === 'word' && /^[0-9.-]+pxv$/i.test(node.value)) {
              const pxvValue = parseFloat(node.value.replace('pxv', ''));

              if (pxvValue === 0) {
                node.value = '0'; // clean zero
              } else {
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
