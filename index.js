const url = Khajana.buildApiUrl({ random: true });

const $viewer = document.querySelector('.shabad-viewer');

fetch(url)
  .then(r => r.json())
  .then(r => {
    if (r.error) {   
      return Promise.reject(r);
    }

    $viewer.dataset.error = "";

    $viewer.dataset.loading = "true";

    const {
      shabadinfo: { pageno: ang, source: { english: granth }, writer: { english: author } },
      gurbani: lines
    } = r;

    $viewer.querySelector('.author').innerText = author;

    $viewer.querySelector('.ang').innerText = ang;

    $viewer.querySelector('.granth').innerText = granth;

    $viewer.querySelector('.bani').innerHTML = lines
  
      .map(({ shabad }) => `
        <div class='shabad-line'>
          <p>${shabad.gurbani.unicode}</p>
          <blockquote>${shabad.translation.english.ssk}</blockquote>
        </div>
      `)
  
      .join('');

    $viewer.dataset.loading = "false";
  })
  .catch(err => {
    console.error(err);
  
    $viewer.dataset.loading = "false";
  
    $viewer.dataset.error = `Sorry, we are facing troubles in getting your shabad`;
  });
