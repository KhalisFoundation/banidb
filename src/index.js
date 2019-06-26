export const TYPES = [
  "First letter each word from start (Gurmukhi)",
  "First letter each word anywhere (Gurmukhi)",
  "Full Word (Gurmukhi)",
  "Full Word Translation (English)",
  "Romanized Gurmukhi (English)"
];

export const SOURCES = {
  all: "All Sources",
  G: "Guru Granth Sahib Ji",
  D: "Dasam Granth Sahib",
  B: "Bhai Gurdas Ji Vaaran",
  A: "Amrit Keertan",
  S: "Bhai Gurdas Singh Ji Vaaran",
  N: "Bhai Nand Lal Ji Vaaran",
  R: "Rehatnamas & Panthic Sources"
};

export const buildApiUrl = options => {
  const {
    q = false, // String: Query string.
    source = false, // String: one of Object.keys(SOURCES).
    type = false, // Number: index of TYPES.
    writer = false, // Number: Writer ID - Check README.md.
    raag = false, // Number: Raag ID - Check README.md.
    ang = false, // Number: Page number of the source.
    results = false, // Number: Count of results you want.
    offset = false, // Number: Used for pagination.
    id = false, // Number: Shabad ID.
    hukam = false, // Boolean: Pass true if you want hukamnama of today.
    akhar = false, // Boolean: Pass true to convert query string (gurulipi) into unicode text.
    lipi = false, // Boolean: Pass true to convert query string (unicode) into gurulipi text.
    random = false, // Boolean: Pass true to get random shabad.
    randomid = false, // Boolean: Pass true to get random shabad id only.
    API_URL = "https://api.banidb.com/" // String: API_URL to hit. (Prod: api.banidb.com, Dev: devapi.khajana.org).
  } = options;

  let url = API_URL;

  if (q !== false) {
    let params = [];

    if (source) params.push(`source=${source}`);

    if (type) params.push(`searchtype=${type}`);

    if (writer) params.push(`writer=${writer}`);

    if (raag) params.push(`raag=${raag}`);

    if (ang) params.push(`ang=${ang}`);

    if (results) params.push(`results=${results}`);

    if (offset) params.push(`offset=${offset}`);

    url += `search/${q}?${params.join("&")}`;
  } else if (id !== false) {
    url += `shabads/${id}`;
  } else if (ang !== false) {
    url += `angs/${ang}/${source ? source : ""}`;
  } else if (hukam !== false) {
    url += `hukamnamas/today`;
  } else if (akhar !== false && lipi !== false) {
    url += `akhar/${lipi}`;
  } else if (randomid !== false) {
    url += `random/id`;
  } else if (random !== false) {
    url += `random`;
  } else {
    throw new Error("Invalid options sent");
  }

  return url;
};
