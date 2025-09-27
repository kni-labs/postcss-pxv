<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>postcss-pxv Tests</title>
    <link rel="stylesheet" href="style.css" />
  </head>
  <body>
    <script>
      document.addEventListener("DOMContentLoaded", () => {
        const h1 = document.querySelector("h1");

        function updateH1() {
          if (!h1) return;

          const vw = window.innerWidth;
          const size = getComputedStyle(h1).fontSize;

          // update text with font size
          h1.innerHTML = h1.textContent.split(" (")[0] + ` (${size})`;

          // reset color
          h1.style.color = "";

          // change font color at key widths
          if (vw === 1024) {
            h1.style.color = "red";
          } else if (vw === 1440) {
            h1.style.color = "green";
          } else if (vw === 2000) {
            h1.style.color = "blue";
          }
        }

        updateH1();
        window.addEventListener("resize", updateH1);
      });
    </script>
    <h1>postcss-pxv Test Cases</h1>
    <p>
      Resize the window to see how <code>pxv</code> values scale between
      <code>--siteMin</code>, <code>--siteBasis</code>, and
      <code>--siteMax</code>.
    </p>

    <section>
      <h2>Typography</h2>
      <p class="typography">
        This paragraph uses our new scalable typography which seems to work
        perfectly with all browser zoom functionality. I'm assuming this was
        mosltly fixed once clamp became standard.
      </p>
    </section>

    <section>
      <h2>Box Model</h2>
      <div class="border">Border & padding test</div>
      <div class="shorthand">Shorthand padding + margin</div>
      <div class="decimal">Decimal pxv values</div>
      <div class="zero-test">Zero pxv value (margin-top = 0)</div>
    </section>

    <section>
      <h2>Positioning</h2>
      <div class="absolute">Absolutely positioned box</div>
      <div class="negativeval">Negative margin-left test</div>
    </section>

    <section>
      <h2>Expressions</h2>
      <div class="weird-stuff">Nested calc() with pxv</div>
    </section>

    <section>
      <h2>Grid & Flex Layout</h2>
      <div class="grid">
        <div>A</div>
        <div>B</div>
        <div>C</div>
      </div>
      <div class="flex">
        <div>1</div>
        <div>2</div>
        <div>3</div>
      </div>
    </section>

    <section>
      <h2>Pseudo-elements</h2>
      <div class="pseudo">This has a ::before element</div>
    </section>

    <section>
      <h2>Form Elements</h2>
      <input type="text" class="test-input" placeholder="Type here..." />
    </section>

    <section>
      <h2>Media Query Test</h2>
      <div class="mq-test">This padding changes at 1600px</div>
    </section>

    <section>
      <h2>Other CSS Properties</h2>
      <div class="extras">Box with radius, shadow, and translate</div>
    </section>

    <section>
      <h2>Selectors Variety</h2>
      <ul>
        <li>List item 1</li>
        <li>List item 2</li>
      </ul>
      <div id="unique">I am an ID selector</div>
      <article>
        <h2>Article Heading</h2>
        <p>Some text here</p>
      </article>
    </section>

    <!-- Info panel -->
    <script>
      document.addEventListener("DOMContentLoaded", () => {
        const info = document.createElement("div");
        info.style.position = "fixed";
        info.style.top = "0";
        info.style.right = "0";
        info.style.background = "rgba(0,0,0,0.85)";
        info.style.color = "white";
        info.style.fontFamily = "system-ui, sans-serif";
        info.style.fontSize = "14px";
        info.style.lineHeight = "1.4";
        info.style.padding = "8px 12px";
        info.style.zIndex = "9999";
        info.style.borderBottomLeftRadius = "6px";
        info.style.pointerEvents = "none";
        document.body.appendChild(info);

        function cssVar(name) {
          return getComputedStyle(document.documentElement)
            .getPropertyValue(name)
            .trim();
        }

        const basisColors = {}; // store basis → color

        function randomColor() {
          return `hsl(${Math.floor(Math.random() * 360)}, 70%, 40%)`;
        }

        function updateInfo() {
          const vw = window.innerWidth;
          const siteMin = parseFloat(cssVar("--siteMin")) || 0;
          const siteBasis = parseFloat(cssVar("--siteBasis")) || 1;
          const siteMax = parseFloat(cssVar("--siteMax")) || 0;

          // If this basis hasn't been seen before, assign it a random color
          if (!basisColors[siteBasis]) {
            basisColors[siteBasis] = randomColor();
          }
          info.style.background = basisColors[siteBasis];

          // calculate 1pxv value
          let pxv = (vw / siteBasis) * 1;
          const minPxv = (siteMin / siteBasis) * 1;
          const maxPxv = (siteMax / siteBasis) * 1;
          pxv = Math.min(Math.max(pxv, minPxv), maxPxv);

          info.innerHTML = `
            <div><strong>Viewport:</strong> ${vw}px</div>
            <div><strong>siteMin:</strong> ${siteMin}</div>
            <div><strong>siteBasis:</strong> ${siteBasis}</div>
            <div><strong>siteMax:</strong> ${siteMax}</div>
            <div><strong>1pxv:</strong> ${pxv.toFixed(2)}px</div>
          `;
        }

        updateInfo();
        window.addEventListener("resize", updateInfo);
      });
    </script>
  </body>
</html>
