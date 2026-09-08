# Offline BaniDB

Read Angs from a local BaniDB SQLite snapshot with the same source, verse, Larivaar, translation, transliteration, Visraam, writer, and Raag fields used by the v2 Ang API. The client works through a small SQLite adapter, so each application can use its existing database driver.

```js
const { createBaniDB } = require('@sttm/banidb/offline');

const bani = createBaniDB({ db: { query } });
const ang = await bani.getAng(1); // Defaults to source G.
```

The existing package entry point continues to build REST URLs. The offline entry point adds no runtime dependencies, imports no native modules, and makes no network requests when reading.

## Platform adapters

`query(sql, parameters)` returns an array of row objects, either directly or through a promise. SQL uses `?` placeholders; pass the parameters to the driver as bindings. The application owns opening and closing its connection.

### React Native with op-sqlite

```ts
import { open } from '@op-engineering/op-sqlite';
import { createBaniDB } from '@sttm/banidb/offline';

const sqlite = open({ name: 'banidb-sehajpath.db', location: databaseDirectory });
const bani = createBaniDB({
  db: {
    query: async <T>(sql: string, parameters: unknown[] = []): Promise<T[]> => {
      const result = await sqlite.execute(sql, parameters as never[]);
      return result.rows as T[];
    },
  },
});

const ang = await bani.getAng(1);
// Close sqlite when your application no longer needs the connection.
```

### Node.js with node:sqlite

```js
const { DatabaseSync } = require('node:sqlite');
const { createBaniDB } = require('@sttm/banidb/offline');

const sqlite = new DatabaseSync('/path/to/banidb-sehajpath.db', { readOnly: true });
const bani = createBaniDB({
  db: { query: (sql, parameters = []) => sqlite.prepare(sql).all(...parameters) },
});

try {
  console.log((await bani.getAng(1)).page);
} finally {
  sqlite.close();
}
```

Browser SQLite engines can implement the same adapter. Browser storage, workers, and database drivers are application choices; this change does not include a browser driver.

## Reading contract

- `getAng(positiveInteger, sourceId = 'G')` returns an `Ang` or `null` if the source/page is absent. It never substitutes another Ang or silently fetches the API.
- Navigation points to the nearest available earlier/later page within the requested source. It returns `null` at the edges and supports partial snapshots.
- Verses sort by line number, then verse ID, matching the Ang API. Non-standard shabad records at or above ID 5000000 are excluded, matching that API's filter.
- The stored Gurmukhi and Unicode strings are returned without normalization. Larivaar removes whitespace using the v2 API's convention; original strings remain available for word-boundary validation.
- Punjabi ASCII and Unicode translations are paired by translation source. Optional metadata is retained; invalid JSON or missing Gurbani rejects the page so the application can report corruption or use its API fallback.
- Independent clients have independent connections. Recreate the client after replacing the database file.

This first version supports single-Ang reads. It does not implement every REST endpoint, search, ranges, or ceremony-specific JSON array formats.

## Database format and lifecycle

Use the SQLite export used by Sehaj Path (`banidb-sehajpath.db`), with `Verse`, `Shabad`, `Writer`, `Raag`, and `Source` tables. `Verse` stores `Gurmukhi`, `GurmukhiUni`, JSON objects in `Translations`, `Transliterations`, and `Visraam`, and page/source/metadata identifiers. See `queries.js` for the exact column contract and `tests/fixtures/offline.sql` for a small schema example. The full Gurbani database is not bundled in this npm package.

Indexes on `Verse(PageNo, SourceID)` and `Shabad(VerseID)` support page reads and navigation. The client issues only SELECT queries; it neither migrates nor alters a supplied database.

Applications should download a snapshot over HTTPS to a temporary file, verify it before installing, preserve the last usable database if downloading or validation fails, and replace it atomically using their platform's filesystem API. Close the old connection before replacing the file and open a new connection afterward. Sehaj Path already has a download, resume, validation, and replacement lifecycle; this module supplies its reusable read interface.

### Explicit update checks

```js
const changed = await bani.checkForUpdate(localMd5, configuredMd5Url);
```

This is an explicit network operation using `fetch`. Pass `{ db, fetch: yourFetcher }` to inject request cancellation, timeouts, or a platform-specific fetcher. HTTP errors, malformed digests, and network failures reject instead of reporting a false update result. The server endpoint must return a plain 32-character hexadecimal MD5 value, optionally followed by whitespace.

MD5 comparison supports the existing snapshot update protocol. It detects changes; it does not establish a file's authenticity. Use a trusted HTTPS distribution endpoint and verify the downloaded file before installing it. Reading an Ang does not run this check.

## Validation

Run `npm test` with Node.js 22.13 or newer (the test suite uses built-in `node:sqlite`). No dependency installation is needed for these tests. They exercise actual SQLite queries, source separation, ordering, navigation, exact text preservation, synchronous/asynchronous adapters, corruption, database errors, bound parameters, and explicit update checks.

To validate a full snapshot, run this from a repository checkout:

```sh
node tests/validate-snapshot.js /path/to/banidb-sehajpath.db
# Optionally compare Ang 1 against a separately saved v2 /angs/1 response:
node tests/validate-snapshot.js /path/to/banidb-sehajpath.db /path/to/api-ang-1.json
```

The validator opens the file read-only, checks every available page's verse order, original text, and navigation, and makes no network requests. The optional API comparison checks the complete JSON response, including translations and metadata; an older snapshot can legitimately differ from the current API.

Validation on September 8, 2026 covered all 1,430 Angs and 60,403 verses in the Sehaj Path snapshot. All original ASCII and Unicode text and navigation boundaries matched, and Ang 1's complete JSON response matched the v2 API response captured that day.

Native driver integration, database downloading, filesystem replacement, and browser SQLite adapters require separate application-level checks.
