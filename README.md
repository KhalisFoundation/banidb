# khajana-js 💎

A JavaScript wrapper for [Khajana](http://khajana.org/) REST [API](https://github.com/KhalisFoundation/KhajanaAPI)

# Usage

The module is built as UMD.
So you can use it directly in a script tag, or you can `require` it.

```html
<!doctype html>
<html>
  <head>
  </head>
  <body>

    <div class="shabad"></div>

    <script src="https://raw.githubusercontent.com/bogas04/khajana-js/master/index.js"></script>

    <script>
      const url = Khajana.buildApiUrl({ random: true });

      const $shabad = document.querySelector('.shabad');

      fetch(url)
        .then(r => r.json())
        .then(r => {
          if (r.error) {
            $shabad.innerText = `Sorry! Couldn't fetch the shabad :(`.
          } else {
            const { gurbani: lines } = r;

            $shabad.innerHTML = lines
              .map(({ shabad }) => `
                <p>${shabad.gurbani.unicode}</p>
                <blockquote>${shabad.translation.english.ssk}</blockquote>
              `);
          }
        })
        .catch(err => {
          console.err(err);
          $shabad.innerText = `Sorry! Couldn't fetch the shabad :(`.
        });
    </script>
  </body>
</html>
```
