'use strict';

const { ANG_QUERY, NAVIGATION_QUERY } = require('./queries');
const { formatVerse } = require('./format-verse');
const { checkForUpdate } = require('./check-for-update');

/**
 * Read a BaniDB SQLite snapshot through an application-owned connection.
 * No native module, filesystem, network request, or global state is created here.
 */
const createBaniDB = ({ db, fetch: fetcher } = {}) => {
  if (!db || typeof db.query !== 'function') {
    throw new TypeError('A SQLite adapter with query(sql, parameters) is required');
  }

  return {
    async getAng(angNumber, sourceId = 'G') {
      if (!Number.isSafeInteger(angNumber) || angNumber < 1) {
        throw new RangeError('angNumber must be a positive safe integer');
      }
      if (typeof sourceId !== 'string' || !sourceId.length) {
        throw new TypeError('sourceId must be a non-empty source identifier');
      }

      const rows = await db.query(ANG_QUERY, [angNumber, sourceId]);
      if (!rows.length) return null;

      const page = rows.map(formatVerse);
      const [navigation] = await db.query(NAVIGATION_QUERY, [
        angNumber, sourceId, angNumber, sourceId,
      ]);
      const source = rows[0];
      return {
        source: {
          sourceId: source.SourceID,
          gurmukhi: source.SourceGurmukhi,
          unicode: source.SourceUnicode,
          english: source.SourceEnglish,
          pageNo: angNumber,
        },
        count: page.length,
        navigation: { previous: navigation.previous, next: navigation.next },
        page,
      };
    },

    checkForUpdate(localMd5, md5Url) {
      return checkForUpdate(localMd5, md5Url, fetcher);
    },
  };
};

module.exports = { createBaniDB, checkForUpdate };
