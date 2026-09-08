'use strict';

// SQLite snapshot schema used by banidb-sehajpath.db. All caller values are bound.
const ANG_QUERY = `
  SELECT v.ID, v.Gurmukhi, v.GurmukhiUni, v.Translations, v.Transliterations,
    v.Visraam, v.PageNo, v.LineNo, v.SourceID, v.WriterID, v.RaagID,
    s.ShabadID,
    MAX(COALESCE(v.Updated, ''), COALESCE(s.Updated, '')) AS Updated,
    w.WriterEnglish, w.WriterGurmukhi, w.WriterUnicode,
    r.RaagEnglish, r.RaagGurmukhi, r.RaagUnicode, r.RaagWithPage,
    src.SourceEnglish, src.SourceGurmukhi, src.SourceUnicode
  FROM Verse v
  JOIN Shabad s ON s.VerseID = v.ID
  LEFT JOIN Writer w ON w.WriterID = v.WriterID
  LEFT JOIN Raag r ON r.RaagID = v.RaagID
  JOIN Source src ON src.SourceID = v.SourceID
  WHERE v.PageNo = ? AND v.SourceID = ? AND s.ShabadID < 5000000
  ORDER BY v.LineNo ASC, v.ID ASC`;

// Navigate only to pages present in this snapshot, including partial snapshots.
const NAVIGATION_QUERY = `
  SELECT
    (SELECT MAX(v.PageNo) FROM Verse v JOIN Shabad s ON s.VerseID = v.ID
      WHERE v.PageNo < ? AND v.SourceID = ? AND s.ShabadID < 5000000) AS previous,
    (SELECT MIN(v.PageNo) FROM Verse v JOIN Shabad s ON s.VerseID = v.ID
      WHERE v.PageNo > ? AND v.SourceID = ? AND s.ShabadID < 5000000) AS next`;

module.exports = { ANG_QUERY, NAVIGATION_QUERY };
