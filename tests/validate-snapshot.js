'use strict';

// Optional integration check against a caller-supplied, unmodified snapshot.
// No database, API response, or network access is bundled with this test.
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { DatabaseSync } = require('node:sqlite');
const { createBaniDB } = require('../offline');

const [databasePath, apiAngOnePath] = process.argv.slice(2);
if (!databasePath) {
  console.error('Usage: node tests/validate-snapshot.js <snapshot.db> [api-ang-1.json]');
  process.exitCode = 1;
} else {
  validate().catch(error => {
    console.error(error);
    process.exitCode = 1;
  });
}

async function validate() {
  const sqlite = new DatabaseSync(databasePath, { readOnly: true });
  try {
    const client = createBaniDB({
      db: { query: (sql, parameters = []) => sqlite.prepare(sql).all(...parameters) },
    });
    const pages = sqlite.prepare(`
      SELECT DISTINCT v.SourceID, v.PageNo FROM Verse v
      JOIN Shabad s ON s.VerseID = v.ID WHERE s.ShabadID < 5000000
      ORDER BY v.SourceID, v.PageNo`).all();
    assert.ok(pages.length, 'Snapshot contains no readable pages');
    let verses = 0;
    for (const [index, { SourceID: source, PageNo: number }] of pages.entries()) {
      const ang = await client.getAng(number, source);
      assert.ok(ang, `Missing source ${source}, Ang ${number}`);
      const rows = sqlite.prepare(`
        SELECT v.ID, v.Gurmukhi, v.GurmukhiUni FROM Verse v
        JOIN Shabad s ON s.VerseID = v.ID
        WHERE v.SourceID = ? AND v.PageNo = ? AND s.ShabadID < 5000000
        ORDER BY v.LineNo, v.ID`).all(source, number);
      assert.equal(ang.count, rows.length);
      assert.deepEqual(
        ang.page.map(verse => [verse.verseId, verse.verse.gurmukhi, verse.verse.unicode]),
        rows.map(row => [row.ID, row.Gurmukhi, row.GurmukhiUni]),
        `Verse order or text differs at source ${source}, Ang ${number}`
      );
      const previous = pages[index - 1];
      const next = pages[index + 1];
      assert.deepEqual(ang.navigation, {
        previous: previous && previous.SourceID === source ? previous.PageNo : null,
        next: next && next.SourceID === source ? next.PageNo : null,
      });
      verses += rows.length;
    }
    if (apiAngOnePath) {
      assert.deepEqual(
        JSON.parse(JSON.stringify(await client.getAng(1))),
        JSON.parse(readFileSync(apiAngOnePath, 'utf8')),
        'Snapshot Ang 1 differs from the supplied API response (check snapshot dates)'
      );
    }
    console.log(JSON.stringify({
      pages: pages.length,
      verses,
      exactTextAndNavigation: true,
      apiAngOneMatches: apiAngOnePath ? true : null,
    }));
  } finally {
    sqlite.close();
  }
}
