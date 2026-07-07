/**
 * Safari A - Settings service
 */

function getSettings() {
  var sheet = getSheet('Settings');
  var data = sheet.getDataRange().getValues();
  var settings = {};

  for (var i = 1; i < data.length; i++) {
    if (data[i][0]) {
      settings[String(data[i][0])] = String(data[i][1] || '');
    }
  }

  return settings;
}

function updateSettings(settings, userMode) {
  if (!settings || typeof settings !== 'object') {
    throw { message: 'Invalid settings object', code: 400 };
  }

  var sheet = getSheet('Settings');
  var data = sheet.getDataRange().getValues();
  var keyMap = {};

  for (var i = 1; i < data.length; i++) {
    keyMap[String(data[i][0])] = i + 1;
  }

  Object.keys(settings).forEach(function (key) {
    if (keyMap[key]) {
      sheet.getRange(keyMap[key], 2).setValue(String(settings[key]));
    } else {
      sheet.appendRow([key, String(settings[key])]);
    }
  });

  logAction('UPDATE_SETTINGS', userMode || 'receiver', Object.keys(settings).join(', '));
  return getSettings();
}
