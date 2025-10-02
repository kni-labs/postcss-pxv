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

      // Helper to ensure vars exist in :root
      const ensureVar = (prop, value) => {
        const already = rootRule.nodes.some(
          (n) => n.type === 'decl' && n.prop === prop
        );
        if (!already) {
          rootRule.append({ prop, value });
        }
      };

      // Default tokens
      ensureVar('--siteMin', '0');      // floor (px), overrideable
      ensureVar('--siteBasis', '375');  // basis (px)
      ensureVar('--siteMax', '600');    // ceiling (px)

      // ✅ One reusable proportional unit
      ensureVar(
        '--pxvUnit',
        'clamp(calc(1px * var(--siteMin) / var(--siteBasis)), calc((100 / var(--siteBasis)) * 1vw), calc(1px * var(--siteMax) / var(--siteBasis)))'
      );

      // Walk declarations for pxv replacement
      root.walkDecls((decl) => {
        if (!decl.value.includes('pxv')) return;

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
