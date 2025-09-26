const valueParser = require('postcss-value-parser');
const postcss = require('postcss');

module.exports = () => {
  return {
    postcssPlugin: 'postcss-pxv',
    Once(root) {
      // Ensure a :root exists
      let rootRule = root.nodes.find(
        (node) => node.type === 'rule' && node.selector === ':root'
      );
      if (!rootRule) {
        rootRule = postcss.rule({ selector: ':root' });
        root.prepend(rootRule);
      }

      // Ensure defaults exist inside :root
      const ensureVar = (prop, value) => {
        const already = rootRule.nodes.some(
          (n) => n.type === 'decl' && n.prop === prop
        );
        if (!already) {
          rootRule.append({ prop, value });
        }
      };

      // Defaults (mobile-first like before)
      ensureVar('--siteBasis', '375');
      ensureVar('--siteMax', '600');

      // The unit definition — centralizes the clamp formula (min back to 0px)
      ensureVar(
        '--pxvUnit',
        'clamp(0px, calc((100 / var(--siteBasis)) * 1vw), calc(1px * var(--siteMax) / var(--siteBasis)))'
      );

      // Walk declarations for pxv replacement
      root.walkDecls((decl) => {
        const parsedValue = valueParser(decl.value);

        parsedValue.walk((node) => {
          if (node.type === 'word' && /^[0-9.-]+pxv$/i.test(node.value)) {
            const pxvValue = parseFloat(node.value.replace('pxv', ''));

            if (pxvValue === 0) {
              node.value = '0'; // clean zero
            } else if (pxvValue > 0) {
              node.value = `calc(${pxvValue} * var(--pxvUnit))`;
            } else {
              const absVal = Math.abs(pxvValue);
              node.value = `calc(-${absVal} * var(--pxvUnit))`;
            }
          }
        });

        decl.value = parsedValue.toString();
      });
    },
  };
};

module.exports.postcss = true;
