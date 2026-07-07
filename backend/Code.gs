/**
 * Safari A - Google Apps Script Backend
 * Main router for REST API endpoints
 */

function doGet(e) {
  return handleRequest(e, 'GET');
}

function doPost(e) {
  return handleRequest(e, 'POST');
}

function handleRequest(e, method) {
  try {
    if (!validateApiKey(e)) {
      return jsonResponse({ success: false, error: 'Unauthorized', code: 401 }, 401);
    }

    const action = (e.parameter && e.parameter.action) || '';
    let payload = {};

    if (method === 'POST' && e.postData && e.postData.contents) {
      payload = JSON.parse(e.postData.contents);
    }

    switch (action) {
      case 'health':
        return jsonResponse({
          success: true,
          data: { status: 'ok', timestamp: new Date().toISOString() },
        });

      case 'getRequests':
        return jsonResponse({ success: true, data: getRequests() });

      case 'createRequest':
        return jsonResponse({ success: true, data: createRequest(payload) });

      case 'updateRequest':
        return jsonResponse({ success: true, data: updateRequest(payload) });

      case 'deleteRequest':
        deleteRequest(payload.requestId, payload.userMode || 'receiver');
        return jsonResponse({ success: true, data: { deleted: true } });

      case 'getFavorites':
        return jsonResponse({ success: true, data: getFavorites() });

      case 'createFavorite':
        return jsonResponse({ success: true, data: createFavorite(payload) });

      case 'updateFavorite':
        return jsonResponse({ success: true, data: updateFavorite(payload) });

      case 'deleteFavorite':
        deleteFavorite(payload.favoriteId, payload.userMode || 'receiver');
        return jsonResponse({ success: true, data: { deleted: true } });

      case 'getSettings':
        return jsonResponse({ success: true, data: getSettings() });

      case 'updateSettings':
        return jsonResponse({ success: true, data: updateSettings(payload.settings, payload.userMode) });

      default:
        return jsonResponse({ success: false, error: 'Unknown action', code: 400 }, 400);
    }
  } catch (error) {
    const message = error.message || 'Internal server error';
    const code = error.code || 500;
    logAction('ERROR', 'system', message);
    return jsonResponse({ success: false, error: message, code: code }, code);
  }
}

function validateApiKey(e) {
  const expectedKey = PropertiesService.getScriptProperties().getProperty('API_SECRET');
  if (!expectedKey) {
    // Allow setup before key is configured
    return true;
  }
  const providedKey = (e.parameter && e.parameter.apiKey) ||
    (e.postData && e.postData.type === 'application/json' &&
      (function () {
        try {
          const headers = e.postData.headers || {};
          return headers['X-Api-Key'] || headers['x-api-key'];
        } catch (err) {
          return null;
        }
      })());

  // Apps Script Web Apps don't always pass custom headers on POST;
  // also check query param and body apiKey field
  if (providedKey === expectedKey) return true;

  if (e.postData && e.postData.contents) {
    try {
      const body = JSON.parse(e.postData.contents);
      if (body.apiKey === expectedKey) return true;
    } catch (err) {
      // ignore
    }
  }

  if (e.parameter && e.parameter.apiKey === expectedKey) return true;

  return false;
}

function jsonResponse(body, statusCode) {
  const output = ContentService.createTextOutput(JSON.stringify(body));
  output.setMimeType(ContentService.MimeType.JSON);
  return output;
}

function getSpreadsheet() {
  try {
    const active = SpreadsheetApp.getActiveSpreadsheet();
    if (active) return active;
  } catch (err) {
    // Fall back to property service
  }
  const ssId = PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID');
  if (!ssId) {
    const err = new Error('SPREADSHEET_ID not configured in Script Properties');
    err.code = 500;
    throw err;
  }
  return SpreadsheetApp.openById(ssId);
}

function getSheet(name) {
  const ss = getSpreadsheet();
  const sheet = ss.getSheetByName(name);
  if (!sheet) {
    const err = new Error('Sheet not found: ' + name);
    err.code = 500;
    throw err;
  }
  return sheet;
}
