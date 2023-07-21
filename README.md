# postcss-pxv

Note this very much a work in progress and hasn't been fully tested yet.

This plugin creates a new pixel-viewport unit of measurement called a `pxv`. 

input:
```css
div { width: 150pxv; }
```
output:
```css
 div { width: clamp(1px, calc(150vw * (100 / var(--siteBasis))), calc(150px * var(--siteMax) / var(--siteBasis))); }
```

"Wow, that looks insane!" you might say. And you'd be right, but there is very good reason for it all, and we've used this very successfully on some [large](https://www.bolt.com) [sites](https://www.washingtonspirit.com).

### When to use

Use this when you want to reach for a `px` but need it to behave like a `vw` unit. Rule must support css `clamp()`:

| ✅ Use with | ❌ Don't use with|
| ----------| --------------|
| `width`   | `font-size`*  |
| `height`  | `border` |
| `padding` (including neg values) | `box-shadow` |
| `margin`  |  |
| `left`, `right`, `top`, `bottom`  |  |

* **Note:**`font-size` *does* support clamp but responsive typography needs a different solution to allow for the browser to still be able to use the zoom functionality. (Please see the 2.0 branch alpha release of  [kni-scss]([https://github.com/kni-labs/kni-scss](https://github.com/kni-labs/kni-scss/tree/2.0) for this.


### Harnessing the power of css custom props

By using css custom properties we can live inject a new "basis" for the scaling.

The plugin requires two custom properties:

- ` --siteBasis` - The size at which your layout was designed
- ` --siteMax` - The size at which you want you comp to stop scaling

In an example implementation you may have a site comped at `1440px`, `768px`, and `375px` for desktop, tablet, andd mobile respectively:
```css
:root {
    --mobile: 375;
    --tablet: 768; 
    --desktop: 1440; 
 
    --mobileMax: 600;
    --tabletMax: 900;
    --desktopMax: 1900;

    --siteBasis: var(--mobileMax); 
    --siteMax: var(--siteMaxMobile);
  }
```
and in a very simple implementation we can handle 95% of all responsive elements with one media query:
```css

@media (min-width: 768px) {
  * {
    --siteBasis: var(--tablet);
    --siteMax: var(--tabletMax);
  }
}
@media (min-width: 1024px) {
  * {
    --siteBasis: var(--desktop);
    --siteMax: var(--desktopMax);
  }
}
```

### Installation

`npm i postcss-pxv --save-dev`


### How to contribute
for now: 

1. `npm i`
2. edit `index.js` or `input.css`
3. process css: `node process-css.js`
