const Khajana = require('khajana');
const fetch = require('node-fetch');
const chalk = require('chalk');

const url = Khajana.buildApiUrl({ random: true });

fetch(url)
  .then(r => r.json())
  .then(r => {
    if (r.error) {
      console.log(chalk.red(`Sorry! Couldn't fetch the shabad :(`));
    } else {
      const { gurbani: lines } = r;

      console.log(lines
        .map(({ shabad }) => `
          ${chalk.blue(shabad.gurbani.unicode)}
            ${chalk.white.bgBlack(shabad.translation.english.ssk)}
        `)
        .join('\n')
      );
    }
  })
  .catch(err => {
    console.log(chalk.red(`Sorry! Couldn't fetch the shabad :(`));
    console.log(err);
  });
