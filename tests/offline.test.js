'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { join } = require('node:path');
const { DatabaseSync } = require('node:sqlite');
const { createBaniDB, checkForUpdate } = require('../offline');

const fixture = readFileSync(join(__dirname, 'fixtures/offline.sql'), 'utf8');
const setup = (t, { asynchronous = false } = {}) => {
  const sqlite = new DatabaseSync(':memory:');
  sqlite.exec(fixture);
  t.after(() => sqlite.close());
  const query = (sql, parameters = []) => sqlite.prepare(sql).all(...parameters);
  return {
    sqlite,
    client: createBaniDB({ db: { query: asynchronous ? async (...args) => query(...args) : query } }),
  };
};

test('existing REST entry point remains available', () => {
  const rest = require('..');
  assert.equal(typeof rest.buildApiUrl, 'function');
  assert.equal(rest.SOURCES.G, 'Guru Granth Sahib Ji');
});

test('requires an explicit SQLite adapter and does not open a connection', () => {
  assert.throws(() => createBaniDB(), /SQLite adapter/);
  assert.throws(() => createBaniDB({ db: {} }), /SQLite adapter/);
  createBaniDB({ db: { query: () => assert.fail('construction must not query') } });
});

for (const asynchronous of [false, true]) {
  test(`reads an Ang with a ${asynchronous ? 'promise' : 'synchronous'} adapter`, async t => {
    const { client, sqlite } = setup(t, { asynchronous });
    sqlite.exec('PRAGMA query_only = ON');
    t.mock.method(globalThis, 'fetch', () => assert.fail('offline reads must not use the network'));
    const ang = await client.getAng(1);
    assert.equal(ang.count, 3);
    assert.deepEqual(ang.page.map(verse => verse.verseId), [11, 12, 10]);
    assert.deepEqual(ang.navigation, { previous: null, next: 3 });
    assert.equal(ang.source.sourceId, 'G');
    assert.equal(ang.source.pageNo, 1);
    assert.equal(ang.source.english, 'Sri Guru Granth Sahib Ji');

    const verse = ang.page[2];
    assert.deepEqual(verse.verse, { gurmukhi: 'siq nwmu', unicode: 'ਸਤਿ ਨਾਮੁ' });
    assert.deepEqual(verse.larivaar, { gurmukhi: 'siqnwmu', unicode: 'ਸਤਿਨਾਮੁ' });
    assert.equal(verse.shabadId, 1);
    assert.equal(verse.lineNo, 2);
    assert.equal(verse.updated, '2026-02-01 00:00:00');
    assert.deepEqual(verse.translation.pu.test, { gurmukhi: 'ascii', unicode: 'unicode' });
    assert.equal(verse.transliteration.english, verse.transliteration.en);
    assert.deepEqual(verse.visraam.sttm, [{ p: 1, t: 'v' }]);
    assert.equal(verse.writer.writerId, 1);
    assert.equal(verse.writer.unicode, null);
    assert.equal(verse.raag.unicode, 'ਜਪ');
  });
}

test('last page and single-page sources have bounded navigation', async t => {
  const { client } = setup(t);
  const last = await client.getAng(3);
  assert.deepEqual(last.navigation, { previous: 1, next: null });
  assert.equal(last.page[0].writer, null);
  assert.equal(last.page[0].raag, null);
  const otherSource = await client.getAng(1, 'D');
  assert.deepEqual(otherSource.page.map(verse => verse.verseId), [30]);
  assert.deepEqual(otherSource.navigation, { previous: null, next: null });
});

test('missing pages/sources return null without clamping to a different Ang', async t => {
  const { client } = setup(t);
  assert.equal(await client.getAng(100), null);
  assert.equal(await client.getAng(1, 'absent'), null);
  assert.equal(await client.getAng(2), null); // Excludes non-standard shabad records.
});

test('bound source parameters cannot alter the database', async t => {
  const { client, sqlite } = setup(t);
  assert.equal(await client.getAng(1, "G'; DROP TABLE Verse; --"), null);
  assert.equal(sqlite.prepare('SELECT COUNT(*) AS count FROM Verse').get().count, 6);
});

test('invalid page numbers and source values reject before reading', async () => {
  const client = createBaniDB({ db: { query: () => assert.fail('invalid input must not query') } });
  for (const page of [0, -1, 1.5, NaN, Infinity, '1', Number.MAX_SAFE_INTEGER + 1]) {
    await assert.rejects(client.getAng(page), /positive safe integer/);
  }
  await assert.rejects(client.getAng(1, ''), /sourceId/);
  await assert.rejects(client.getAng(1, null), /sourceId/);
});

for (const field of ['Translations', 'Transliterations', 'Visraam']) {
  test(`a corrupt ${field} value rejects the whole page`, async t => {
    const { client, sqlite } = setup(t);
    sqlite.prepare(`UPDATE Verse SET ${field} = ? WHERE ID = 10`).run('{broken');
    await assert.rejects(client.getAng(1), new RegExp(`Invalid ${field}.*10`));
    sqlite.prepare(`UPDATE Verse SET ${field} = ? WHERE ID = 10`).run('[]');
    await assert.rejects(client.getAng(1), new RegExp(`Invalid ${field}.*10`));
  });
}

test('missing Gurbani rejects the page rather than inventing replacement text', async t => {
  const { client, sqlite } = setup(t);
  sqlite.exec('UPDATE Verse SET GurmukhiUni = NULL WHERE ID = 10');
  await assert.rejects(client.getAng(1), /Missing Gurbani text.*10/);
});

test('database errors propagate so the application can choose recovery or API fallback', async () => {
  const error = new Error('database disk image is malformed');
  const client = createBaniDB({ db: { query: () => { throw error; } } });
  await assert.rejects(client.getAng(1), caught => caught === error);
});

test('clients have independent connections without global database state', async t => {
  const first = setup(t);
  const second = setup(t);
  second.sqlite.exec('DELETE FROM Verse WHERE PageNo = 1');
  assert.equal((await first.client.getAng(1)).count, 3);
  assert.equal(await second.client.getAng(1), null);
});

const digest = 'a'.repeat(32);
const url = 'https://example.test/banidb.md5';
const response = text => ({ ok: true, status: 200, text: async () => text });

test('an explicit update check compares digests, tolerating case and trailing newlines', async () => {
  assert.equal(await checkForUpdate(digest, url, async () => response(digest.toUpperCase() + '\n')), false);
  const client = createBaniDB({ db: { query() {} }, fetch: async () => response('b'.repeat(32)) });
  assert.equal(await client.checkForUpdate(digest, url), true);
});

test('update checks reject bad digests, HTTP errors, and network failures', async () => {
  const noFetch = () => assert.fail('invalid arguments must not fetch');
  await assert.rejects(checkForUpdate('invalid', url, noFetch), /localMd5/);
  await assert.rejects(checkForUpdate(digest, '', noFetch), /md5Url/);
  await assert.rejects(checkForUpdate(digest, url, async () => response('<html>Error</html>')), /valid MD5/);
  await assert.rejects(checkForUpdate(digest, url, async () => ({ ok: false, status: 503 })), /HTTP 503/);
  const error = new Error('offline');
  await assert.rejects(checkForUpdate(digest, url, async () => { throw error; }), caught => caught === error);
});
