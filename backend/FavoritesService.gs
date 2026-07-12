/**
 * Safari A - Favorites service
 *
 * Sheet columns (1-indexed):
 *  1  Favorite ID
 *  2  Phone Number
 *  3  Customer Name
 *  4  Description
 *  5  Created Date
 */

var NUM_FAVORITE_COLS = 5;

function getFavorites() {
  var sheet = getSheet('Favorites');
  var data = sheet.getDataRange().getValues();
  if (data.length <= 1) return [];

  var favorites = [];
  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    if (!row[0]) continue;
    favorites.push(rowToFavorite(row));
  }

  return favorites;
}

function rowToFavorite(row) {
  return {
    favoriteId:   String(row[0]),
    phoneNumber:  String(row[1]),
    customerName: String(row[2]),
    description:  String(row[3] || ''),
    createdDate:  cleanString(row[4], 'date'),
  };
}

function findFavoriteRow(sheet, favoriteId) {
  var data = sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][0]) === String(favoriteId)) {
      return i + 1; // 1-based sheet row
    }
  }
  return -1;
}

function createFavorite(payload) {
  validateRequired(payload.favoriteId, 'favoriteId');
  validateRequired(payload.phoneNumber, 'phoneNumber');
  validateRequired(payload.customerName, 'customerName');

  if (!validatePhone(payload.phoneNumber)) {
    throw { message: 'Invalid phone number', code: 400 };
  }

  var sheet = getSheet('Favorites');

  if (findFavoriteRow(sheet, payload.favoriteId) !== -1) {
    throw { message: 'Favorite ID already exists', code: 400 };
  }

  var row = [
    payload.favoriteId,
    normalizePhone(payload.phoneNumber),
    payload.customerName,
    payload.description || '',
    payload.createdDate || new Date().toISOString().split('T')[0],
  ];

  sheet.appendRow(row);
  logAction('CREATE_FAVORITE', payload.userMode || 'receiver', payload.favoriteId);

  return rowToFavorite(row);
}

function updateFavorite(payload) {
  validateRequired(payload.favoriteId, 'favoriteId');

  var sheet = getSheet('Favorites');
  var rowIndex = findFavoriteRow(sheet, payload.favoriteId);

  if (rowIndex === -1) {
    throw { message: 'Favorite not found', code: 404 };
  }

  // Fetch exactly 1 row, all columns
  var row = sheet.getRange(rowIndex, 1, 1, NUM_FAVORITE_COLS).getValues()[0];

  if (payload.phoneNumber !== undefined) {
    if (!validatePhone(payload.phoneNumber)) {
      throw { message: 'Invalid phone number', code: 400 };
    }
    row[1] = normalizePhone(payload.phoneNumber);
  }
  if (payload.customerName !== undefined) row[2] = payload.customerName;
  if (payload.description !== undefined) row[3] = payload.description;

  sheet.getRange(rowIndex, 1, 1, NUM_FAVORITE_COLS).setValues([row]);
  logAction('UPDATE_FAVORITE', payload.userMode || 'receiver', payload.favoriteId);

  return rowToFavorite(row);
}

function deleteFavorite(favoriteId, userMode) {
  validateRequired(favoriteId, 'favoriteId');

  var sheet = getSheet('Favorites');
  var rowIndex = findFavoriteRow(sheet, favoriteId);

  if (rowIndex === -1) {
    throw { message: 'Favorite not found', code: 404 };
  }

  sheet.deleteRow(rowIndex);
  logAction('DELETE_FAVORITE', userMode, favoriteId);
}
