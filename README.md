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

Wow that looks insane you might say. And you'd be right, but there is very good reason for it all and we've used this very successfully in the past to create sites that scale better with much less code.

### Harnessing the power of css custom props

By using css custom properties we can live inject a new "basis" for the scaling.

The plugin requires two custom properties:

- ` --siteBasis` - The size at which your comp was designed
- ` --siteMax` - The size at which you want you comp to stop scaling

So for example we could add a few more custom props:
```css
:root {
    --siteBasisMobile: 375;
    --siteBasisDesktop: 1440;
    --siteBasis: var(--siteBasisMobile);
    --siteMaxMobile: 600;
    --siteMaxDesktop: 2000;
    --siteMax: var(--siteMaxMobile);
  }
```

and in a very simple implementation we can handle 95% of all responsive elements with one media query:

```css
@media (min-width: 1024px) {
  * {
    --siteBasis: var(--siteBasisDesktop);
    --siteMax: var(--siteMaxDesktop);
  }
}
```



### How to contribute
for now: 

1. `npm i`
2. edit `index.js` or `input.css`
3. process css: `node process-css.js`
