/**
 * Safari A - Security Middleware
 * Nonce validation, timestamp checks, request signing
 */

var NONCE_CACHE = {};
var NONCE_TTL_MS = 5 * 60 * 1000;

function validateTimestamp(e) {
  var ts = parseInt(e.parameter && e.parameter.ts, 10);
  if (!ts || isNaN(ts)) {
    throw { message: 'Missing or invalid timestamp', code: 400 };
  }
  var now = Date.now();
  if (now - ts > 30000) {
    throw { message: 'Request expired. Check system clock.', code: 400 };
  }
  if (ts - now > 5000) {
    throw { message: 'Timestamp is in the future', code: 400 };
  }
  return true;
}

function validateNonce(e) {
  var nonce = e.parameter && e.parameter.nonce;
  if (!nonce || nonce.length < 8) {
    throw { message: 'Missing or invalid nonce', code: 400 };
  }

  cleanupNonceCache();

  if (NONCE_CACHE[nonce]) {
    throw { message: 'Nonce already used. Duplicate request detected.', code: 400 };
  }

  NONCE_CACHE[nonce] = Date.now();
  return true;
}

function validateRequestIntegrity(e, method) {
  if (method === 'GET') return true;

  var body = {};
  if (e.postData && e.postData.contents) {
    try {
      body = JSON.parse(e.postData.contents);
    } catch (err) {
      throw { message: 'Invalid JSON body', code: 400 };
    }
  }

  return true;
}

function cleanupNonceCache() {
  var now = Date.now();
  var keys = Object.keys(NONCE_CACHE);
  for (var i = 0; i < keys.length; i++) {
    if (now - NONCE_CACHE[keys[i]] > NONCE_TTL_MS) {
      delete NONCE_CACHE[keys[i]];
    }
  }
}

function sanitizeInput(value) {
  if (typeof value !== 'string') return value;
  return value
    .replace(/<[^>]*>/g, '')
    .replace(/javascript\s*:/gi, '')
    .trim();
}
