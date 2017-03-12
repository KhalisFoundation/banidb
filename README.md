# khajana-js 💎

A JavaScript wrapper for [Khajana](http://khajana.org/) REST [API](https://github.com/KhalisFoundation/KhajanaAPI)

# Usage

The module is built as UMD.
So you can use it directly in a script tag, or you can `require` it.

## node

```javascript
const Khajana = require('khajana');
const fetch = require('node-fetch');
const chalk = require('chalk');

fetch(url)
  .then(r => r.json())
  .then(r => {
    if (r.error) {
      console.log(chalk.red(`Sorry! Couldn't fetch the shabad :(`));
    } else {
      const { gurbani: lines } = r;

      $shabad.innerHTML = lines
        .map(({ shabad }) => `
          ${chalk.blue(shabad.gurbani.unicode)}
            ${chalk.grey(shabad.translation.english.ssk)}
        `.trim());
    }
  })
  .catch(err => {
    console.log(chalk.red(`Sorry! Couldn't fetch the shabad :(`));
    console.log(err);
  });
```

## web

```html
<!doctype html>
<html>
  <head>
  </head>
  <body>

    <div class="shabad"></div>

    <!-- You might want to host it somewhere reliable. -->
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
              `)
              .join('');
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
