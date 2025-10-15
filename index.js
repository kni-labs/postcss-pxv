const valueParser = require('postcss-value-parser');
const postcss = require('postcss');

module.exports = (opts = {}) => {
  // Default settings
  const defaults = {
    siteMin: 0,
    siteBasis: 375,
    siteMax: 767,
    vars: {
      min: '--site-min',
      basis: '--site-basis',
      max: '--site-max',
      unit: '--pxv-unit',
    },
    writeVars: true, // set to false if project already defines them
  };

  // Merge user config
  const settings = {
    ...defaults,
    ...opts,
    vars: { ...defaults.vars, ...(opts.vars || {}) },
  };

  return {
    postcssPlugin: 'postcss-pxv',

    Once(root) {
      let rootRule;

      // Ensure a :root exists if we're writing vars
      if (settings.writeVars) {
        rootRule = root.nodes.find(
          (node) => node.type === 'rule' && node.selector === ':root'
        );
        if (!rootRule) {
          rootRule = postcss.rule({ selector: ':root' });
          root.prepend(rootRule);
        }

        // Helper to append var if missing
        const ensureVar = (prop, value) => {
          const exists = rootRule.nodes.some(
            (n) => n.type === 'decl' && n.prop === prop
          );
          if (!exists) rootRule.append({ prop, value });
        };

        // Write vars only if allowed
        ensureVar(settings.vars.min, settings.siteMin.toString());
        ensureVar(settings.vars.basis, settings.siteBasis.toString());
        ensureVar(settings.vars.max, settings.siteMax.toString());
        ensureVar(
          settings.vars.unit,
          `clamp(
            calc(1px * var(${settings.vars.min}) / var(${settings.vars.basis})),
            calc((100 / var(${settings.vars.basis})) * 1vw),
            calc(1px * var(${settings.vars.max}) / var(${settings.vars.basis}))
          )`
        );
      }

      // Replace pxv values
      root.walkDecls((decl) => {
        const parsed = valueParser(decl.value);

        parsed.walk((node) => {
          if (node.type === 'word' && /^[0-9.-]+pxv$/i.test(node.value)) {
            const pxvValue = parseFloat(node.value.replace('pxv', ''));

            if (pxvValue === 0) {
              node.value = '0';
            } else {
              const absVal = Math.abs(pxvValue);
              const sign = pxvValue < 0 ? '-' : '';
              node.value = `calc(${sign}${absVal} * var(${settings.vars.unit}))`;
            }
          }
        });

        decl.value = parsed.toString();
      });
    },
  };
};

module.exports.postcss = true;
