/**
 * Safari A - Logging service
 */

function logAction(action, userMode, details) {
  try {
    var ss = getSpreadsheet();
    var sheet = ss.getSheetByName('Logs');
    if (!sheet) {
      sheet = ss.insertSheet('Logs');
      sheet.appendRow(['Timestamp', 'Action', 'User Mode', 'Details']);
      sheet.getRange(1, 1, 1, 4).setFontWeight('bold');
    }
    sheet.appendRow([
      new Date().toISOString(),
      action,
      userMode || 'unknown',
      details || '',
    ]);
  } catch (error) {
    // Logging should not break main flow
    Logger.log('Log failed: ' + error.message);
  }
}

function setupSheets() {
  var ss = getSpreadsheet();

  setupSheet(ss, 'Requests', [
    'Request ID', 'Buyer Phone', 'Amount', 'Description', 'Status',
    'Created Date', 'Created Time', 'Completed Date', 'Completed Time', 'Last Updated', 'ISO Timestamp'
  ]);

  setupSheet(ss, 'Favorites', [
    'Favorite ID', 'Phone Number', 'Customer Name', 'Description', 'Created Date'
  ]);

  setupSheet(ss, 'Settings', ['Key', 'Value']);
  setupSheet(ss, 'Logs', ['Timestamp', 'Action', 'User Mode', 'Details']);

  var settingsSheet = ss.getSheetByName('Settings');
  if (settingsSheet.getLastRow() <= 1) {
    settingsSheet.appendRow(['app_version', '1.0.0']);
    settingsSheet.appendRow(['default_theme', 'system']);
  }

  Logger.log('Sheets setup complete');
}

function setupSheet(ss, name, headers) {
  var sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
  }
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(headers);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
  }
}
