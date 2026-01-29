# postcss-pxv

Syntactic sugar for fluid scaling. Converts **`pxv`** units into CSS Variable-driven calculations.

**Input:**
```css
.box { width: 300pxv; }
```
**Output:**

```css
.box { width: calc(300 * var(--pxv-unit)); }
```

### Setup

1. Install: `npm install -D postcss-pxv`
2. PostCSS Config:
```
module.exports = {
  plugins: [
    require('postcss-pxv')
  ]
}
```
3. Define Logic in CSS: You must define your scaling math in your `:root`. For the latest production-ready logic , see: <a href="https://github.com/kni-labs/kni-cascade">KNI Cascade</a>

### New in 3.0
- No hardcoded math or baked vars; you control the scaling in your CSS.
- `--pxv-unit` is untouched. Upgrading previous code basis means just updating the css vars.
- Still polite: `0pxv` converts to a clean `0`.

### Contributing & testing

1. Install dependencies: `npm install`
2. Edit `index.js` or `input.css`
3. Process the css: `node process-css.js`
4. View changes in `index.html`



