const valueParser = require('postcss-value-parser');
const postcss = require('postcss');

module.exports = (opts = {}) => {
  // allow overrides from options, fallback to defaults
  const basis = opts.min || 375;
  const max = opts.max || 600;

  return {
    postcssPlugin: 'postcss-pxv',
    Once(root) {
      //
      // 1. Ensure :root exists (create if missing)
      //
      let rootRule = root.nodes.find(
        (node) => node.type === 'rule' && node.selector === ':root'
      );

      if (!rootRule) {
        rootRule = postcss.rule({
          selector: ':root',
          source: root.source
        });
        root.prepend(rootRule);
      }

      //
      // 2. Only add missing variables (don’t overwrite existing)
      //
      function ensureVar(rule, prop, value) {
        const exists = rule.nodes.some(
          (decl) => decl.type === 'decl' && decl.prop === prop
        );

        if (!exists) {
          rule.append(
            postcss.decl({
              prop,
              value,
              source: root.source
            })
          );
        }
      }

      ensureVar(rootRule, '--siteBasis', String(basis));
      ensureVar(rootRule, '--siteMax', String(max));
      ensureVar(
        rootRule,
        '--pxvUnit',
        `clamp(0px, calc((100 / var(--siteBasis)) * 1vw), calc(1px * var(--siteMax) / var(--siteBasis)))`
      );

      //
      // 3. Convert pxv values → calc(... * var(--pxvUnit))
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
