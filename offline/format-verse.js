'use strict';

const isObject = value => value !== null && typeof value === 'object' && !Array.isArray(value);

const readObject = (row, column) => {
  try {
    const value = JSON.parse(row[column]);
    if (isObject(value)) return value;
  } catch (_) {
    // Do not silently turn a damaged snapshot into incomplete reading content.
  }
  throw new Error(`Invalid ${column} in offline BaniDB verse ${row.ID}`);
};

const formatVerse = row => {
  if (typeof row.Gurmukhi !== 'string' || typeof row.GurmukhiUni !== 'string') {
    throw new Error(`Missing Gurbani text in offline BaniDB verse ${row.ID}`);
  }

  const translations = readObject(row, 'Translations');
  const transliterations = readObject(row, 'Transliterations');
  const pu = isObject(translations.pu) ? translations.pu : {};
  const puu = isObject(translations.puu) ? translations.puu : {};
  const punjabi = Object.fromEntries(
    Array.from(new Set([...Object.keys(pu), ...Object.keys(puu)])).map(key => [
      key, { gurmukhi: pu[key], unicode: puu[key] },
    ])
  );

  return {
    verseId: row.ID,
    shabadId: row.ShabadID,
    verse: { gurmukhi: row.Gurmukhi, unicode: row.GurmukhiUni },
    larivaar: {
      gurmukhi: row.Gurmukhi.replace(/\s+/g, ''),
      unicode: row.GurmukhiUni.replace(/\s+/g, ''),
    },
    translation: {
      en: translations.en || {},
      pu: punjabi,
      es: translations.es || {},
      hi: translations.hi || {},
    },
    transliteration: {
      english: transliterations.en,
      hindi: transliterations.hi,
      en: transliterations.en,
      hi: transliterations.hi,
      ipa: transliterations.ipa,
      ur: transliterations.ur,
    },
    pageNo: row.PageNo,
    lineNo: row.LineNo,
    updated: row.Updated,
    visraam: readObject(row, 'Visraam'),
    writer: row.WriterID == null ? null : {
      writerId: row.WriterID,
      gurmukhi: row.WriterGurmukhi,
      unicode: row.WriterUnicode,
      english: row.WriterEnglish,
    },
    raag: row.RaagID == null ? null : {
      raagId: row.RaagID,
      gurmukhi: row.RaagGurmukhi,
      unicode: row.RaagUnicode,
      english: row.RaagEnglish,
      raagWithPage: row.RaagWithPage,
    },
  };
};

module.exports = { formatVerse };
