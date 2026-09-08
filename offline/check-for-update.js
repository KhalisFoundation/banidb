'use strict';

const MD5_PATTERN = /^[a-f0-9]{32}$/i;

/** Explicit network operation; an offline read never calls this helper. */
const checkForUpdate = async (localMd5, md5Url, fetcher) => {
  if (typeof localMd5 !== 'string' || !MD5_PATTERN.test(localMd5)) {
    throw new TypeError('localMd5 must be a 32-character hexadecimal digest');
  }
  if (typeof md5Url !== 'string' || !md5Url.trim()) {
    throw new TypeError('md5Url must be a non-empty URL');
  }
  const request = fetcher || (typeof fetch === 'function' ? fetch : undefined);
  if (typeof request !== 'function') {
    throw new TypeError('Provide a fetch implementation to check for database updates');
  }
  const response = await request(md5Url);
  if (!response.ok) {
    throw new Error(`Offline BaniDB update check failed: HTTP ${response.status}`);
  }
  const remoteMd5 = (await response.text()).trim();
  if (!MD5_PATTERN.test(remoteMd5)) {
    throw new Error('Database update endpoint did not return a valid MD5 digest');
  }
  return remoteMd5.toLowerCase() !== localMd5.toLowerCase();
};

module.exports = { checkForUpdate };
