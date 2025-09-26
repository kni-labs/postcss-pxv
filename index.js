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

      // Defaults
      ensureVar('--siteMin', '0');      // ✅ can override
      ensureVar('--siteBasis', '375');
      ensureVar('--siteMax', '600');

      // Fluid unit
      ensureVar(
        '--pxvUnit',
        'calc((100 / var(--siteBasis)) * 1vw)'
      );

      // Walk declarations for pxv replacement
      root.walkDecls((decl) => {
        const parsedValue = valueParser(decl.value);

        parsedValue.walk((node) => {
          if (node.type === 'word' && /^[0-9.-]+pxv$/i.test(node.value)) {
            const pxvValue = parseFloat(node.value.replace('pxv', ''));

            if (pxvValue === 0) {
              node.value = '0';
            } else {
              const absVal = Math.abs(pxvValue);

              // Core clamp with min/basis/max
              let clampExpr = `clamp(
                calc(${absVal}px * var(--siteMin) / var(--siteBasis)),
                calc(${absVal} * var(--pxvUnit)),
                calc(${absVal}px * var(--siteMax) / var(--siteBasis))
              )`;

              // Preserve sign for negatives
              if (pxvValue < 0) {
                clampExpr = `calc(-1 * ${clampExpr})`;
              }

              node.value = clampExpr.replace(/\s+/g, ' '); // minify spaces
            }
          }
        });

        decl.value = parsedValue.toString();
      });
    },
  };
};

module.exports.postcss = true;
