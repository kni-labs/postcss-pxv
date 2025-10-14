# postcss-pxv

A PostCSS plugin that introduces a new CSS unit: **`pxv`** — a pixel that scales with the viewport.  

Sometimes layouts need the precision of pixels but the flexibility of viewport units. That’s where `pxv` comes in: it’s like a pixel that flexes with the viewport.

**Input:**
```css
.box {
  width: 300pxv;
  margin-bottom: 16pxv;
}
```

**Output:**
```css
.box {
  width: calc(300 * var(--pxvUnit));
  margin-bottom: calc(16 * var(--pxvUnit));
}
```

**Which looks like this when computed (note actual code is much trimmer):**
```css
:root {
  --siteBasis: 375;
  --siteMax: 600;
  --pxvUnit: clamp(0px, calc((100 / 375) * 1vw), calc(1px * 600 / 375));
}

.box {
  width: clamp(0px, calc(300vw * (100 / 375)), calc(300px * 600 / 375));
  margin-bottom: clamp(0px, calc(16vw * (100 / 375)), calc(16px * 600 / 375));
}
```

---

Using `pxv` means:
- Layout values stay proportional as screens get bigger or smaller
- One shared formula in `:root` replaces hundreds of repeated `clamp()` calls
- Adjusting scaling is as simple as tweaking two variables

---


## ⚙️ Configuration

** Note:** `v2.x` has configuration changes



Add `postcss-pxv` to your PostCSS pipeline, then configure it in your `postcss.config.js` file.

```js
// postcss.config.js
module.exports = {
  plugins: [
    require('postcss-pxv')({
      // 🔧 Main settings
      siteMin: 0,               // Minimum viewport width in px
      siteBasis: 375,           // Reference design width
      siteMax: 767,             // Maximum viewport width in px
      writeVars: false,         // Automatically injects CSS variables into :root

      // 🎛 Optional variable overrides (use if your CSS tokens differ)
      vars: {
        min: '--siteMin',       // default: --site-min
        basis: '--siteBasis',   // default: --site-basis
        max: '--siteMax',       // default: --site-max
        unit: '--pxvUnit'       // default: --pxv-unit
      }
    })
  ]
}
```

---

## 🚀 What’s new in v2.0

Version 2 outputs cleaner, smaller CSS by centralizing the `clamp()` logic into a shared `--pxvUnit` variable.  
The plugin automatically injects the needed variables (`--siteBasis`, `--siteMax`, `--pxvUnit`) if they’re not already defined, so it should just work out of the box.  

Previously, every use of `pxv` generated a full `clamp()` expression inline, leading to significant repetition and larger CSS files. The improved approach now references a shared `--pxvUnit` variable, drastically reducing repetition and file size—often by up to ~75% for projects with many `pxv` values.


```css
/* v1 output */
h1 {
  font-size: clamp(0px, calc(24vw * (100 / 375)), calc(24px * 600 / 375));
}
```

In v2, the same value references a central variable:

```css
/* v2 output */
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

## 📦 Installation

```bash
npm install -D postcss-pxv
# or
pnpm add -D postcss-pxv
```

---

## 🛠️ Contributing

1. Install dependencies: `npm install` or `pnpm install`  
2. Edit `index.js`  
3. Test locally with `node process-css.js` or link into a project  
4. Open a PR 🚀  
