# Changelog

## [2.0.0] - 2025-09-25

### Changes
- `pxv` values now reference a shared `--pxvUnit` variable instead of inlining `clamp()` for every declaration.
- The plugin automatically injects `--siteBasis`, `--siteMax`, and `--pxvUnit` into `:root`.  
- If these variables are already defined in your project, the plugin will not overwrite them.  
- This means existing projects may need to ensure `--pxvUnit` is defined at runtime (defaults are provided automatically).

### ✨ Added
- Plugin options for `min` and `max` values in `postcss.config.js`:
  ```js
  module.exports = {
    plugins: {
      'postcss-pxv': {
        min: 375, // default
        max: 600  // default
      }
    }
  }
  ```
- Non-destructive variable injection: `--siteBasis`, `--siteMax`, and `--pxvUnit` are only added if missing.

### 🛠 Improvements
- Injected nodes now inherit `source` information from the root, fixing PostCSS warnings about the missing `from` option.
- Codebase cleaned up to merge with existing `:root` blocks instead of always creating new ones.

### 🔄 Upgrade guide
**Before (v1 output):**
```css
h1 {
  font-size: clamp(0px, calc(24vw * (100 / 375)), calc(24px * 600 / 375));
}
```

**After (v2 output):**
```css
:root {
  --siteBasis: 375;
  --siteMax: 600;
  --pxvUnit: clamp(
    0px,
    calc((100 / var(--siteBasis)) * 1vw),
    calc(1px * var(--siteMax) / var(--siteBasis))
  );
}

h1 {
  font-size: calc(24 * var(--pxvUnit));
}
```

Most projects won’t need any changes — defaults are injected automatically.  
If you want to tie scaling to your own design tokens, just alias them:

```css
:root {
  --siteBasis: var(--mobile);
  --siteMax: var(--mobileMax);
}
```
