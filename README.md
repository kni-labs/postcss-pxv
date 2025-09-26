# postcss-pxv

A PostCSS plugin that introduces a new CSS unit: **`pxv`** — a pixel that scales with the viewport.  

Instead of hand-writing `clamp()` everywhere, code can stay simple. Here’s how it works:

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

**Which actually resolves in the browser to (with default variables):**
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

## ✨ Why `pxv`?

There are times when `px` feels natural but a value really needs to scale with the viewport. `pxv` acts like a pixel that knows how to flex:  

- Scales predictably between a chosen basis and a max breakpoint  
- Removes repetitive `clamp()` boilerplate  
- Keeps scaling logic in one place (`:root`), so adjustments are easier  

## 📉 Smaller CSS, fewer bytes

Previously, every use of `pxv` generated a full `clamp()` expression inline, leading to significant repetition and larger CSS files. The improved approach now references a shared `--pxvUnit` variable, drastically reducing repetition and file size—often by up to ~75% for projects with many `pxv` values.

### Before:

```css
h1 {
  font-size: clamp(0px, calc(24vw * (100 / 375)), calc(24px * 600 / 375));
  margin-bottom: clamp(0px, calc(16vw * (100 / 375)), calc(16px * 600 / 375));
  padding-left: clamp(0px, calc(12vw * (100 / 375)), calc(12px * 600 / 375));
}
```

### After:

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
  margin-bottom: calc(16 * var(--pxvUnit));
  padding-left: calc(12 * var(--pxvUnit));
}
```

---

## ✅ Where it fits

Examples of properties that work well with `pxv`:  

| Works well for | Not a good fit |
|----------------|----------------|
| `width`, `height` | `font-size`* |
| `padding`, `margin` | |
| `left`, `right`, `top`, `bottom` | |
| `box-shadow`, `border` | |

\* `font-size` supports `clamp()`, but responsive typography often benefits from a separate approach so zoom and accessibility are preserved. (See the 2.0 branch of [kni-scss](https://github.com/kni-labs/kni-scss/tree/2.0).)

---

## ⚙️ Configuration

### PostCSS options

```js
// postcss.config.js
module.exports = {
  plugins: {
    'postcss-pxv': {
      min: 375,   // default
      max: 600    // default
    }
  }
}
```

### Sample project setup

A project might define breakpoints like this:

```css
:root {
  --mobileMin: 320;
  --mobile: 375;
  --mobileMax: 600;

  --desktopMin: 1024;
  --desktop: 1440;
  --desktopMax: 1800;

  /* Mobile-first defaults */
  --siteBasis: var(--mobile);
  --siteMax: var(--mobileMax);
}

@media (min-width: 1024px) {
  :root {
    --siteBasis: var(--desktop);
    --siteMax: var(--desktopMax);
  }
}
```

This pattern keeps design tokens like `--mobile` and `--desktop` in one place, while `--siteBasis` and `--siteMax` act as pointers for scaling.

---

## 🚀 What’s new in v2.0

Version 2 outputs cleaner, smaller CSS by centralizing the `clamp()` logic into a shared `--pxvUnit` variable.  
The plugin automatically injects the needed variables (`--siteBasis`, `--siteMax`, `--pxvUnit`) if they’re not already defined, so it should just work out of the box.  

---

## 🔄 Upgrading from v1 to v2

In v1, each `pxv` expanded inline:

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

### Upgrade notes
- If defaults work, nothing else is needed — the plugin injects them.  
- If a project already has design tokens, `--siteBasis` and `--siteMax` can point to them:  

```css
:root {
  --siteBasis: var(--mobile);
  --siteMax: var(--mobileMax);
}
```

That’s the only adjustment when moving from v1 to v2.  

---

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
