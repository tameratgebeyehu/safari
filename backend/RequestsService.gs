/**
 * Safari A - Requests service
 *
 * Sheet columns (1-indexed):
 *  1  Request ID
 *  2  Buyer Phone
 *  3  Amount
 *  4  Description
 *  5  Status
 *  6  Created Date
 *  7  Created Time
 *  8  Completed Date
 *  9  Completed Time
 * 10  Last Updated
 * 11  ISO Timestamp  ← created timestamp, never changed after creation
 */

var REQUEST_HEADERS = [
  'Request ID', 'Buyer Phone', 'Amount', 'Description', 'Status',
  'Created Date', 'Created Time', 'Completed Date', 'Completed Time',
  'Last Updated', 'ISO Timestamp'
];

var NUM_REQUEST_COLS = 11;

function getRequests() {
  var sheet = getSheet('Requests');
  var data = sheet.getDataRange().getValues();
  if (data.length <= 1) return [];

  var requests = [];
  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    if (!row[0]) continue;
    requests.push(rowToRequest(row));
  }

  requests.sort(function (a, b) {
    return new Date(b.isoTimestamp).getTime() - new Date(a.isoTimestamp).getTime();
  });

  return requests;
}

function rowToRequest(row) {
  var iso = row[10] ? cleanString(row[10], 'iso') : cleanString(row[9], 'iso');
  return {
    requestId:     String(row[0]),
    buyerPhone:    String(row[1]),
    amount:        Number(row[2]),
    description:   String(row[3] || ''),
    status:        String(row[4]),
    createdDate:   cleanString(row[5], 'date'),
    createdTime:   cleanString(row[6], 'time'),
    completedDate: row[7] ? cleanString(row[7], 'date') : '',
    completedTime: row[8] ? cleanString(row[8], 'time') : '',
    lastUpdated:   cleanString(row[9], 'iso'),
    isoTimestamp:  iso,
  };
}

function findRequestRow(sheet, requestId) {
  var data = sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][0]) === String(requestId)) {
      return i + 1; // 1-based sheet row
    }
  }
  return -1;
}

function createRequest(payload) {
  validateRequired(payload.requestId, 'requestId');
  validateRequired(payload.buyerPhone, 'buyerPhone');
  validateRequired(payload.amount, 'amount');

  if (!validatePhone(payload.buyerPhone)) {
    throw { message: 'Invalid phone number', code: 400 };
  }
  if (!validateAmount(payload.amount)) {
    throw { message: 'Invalid amount', code: 400 };
  }
  if (!validateDescription(payload.description)) {
    throw { message: 'Description too long (max 100 chars)', code: 400 };
  }

  var sheet = getSheet('Requests');

  if (findRequestRow(sheet, payload.requestId) !== -1) {
    throw { message: 'Request ID already exists', code: 400 };
  }

  var now = new Date().toISOString();
  var isoTs = payload.isoTimestamp || now;

  var row = [
    payload.requestId,
    normalizePhone(payload.buyerPhone),
    parseInt(payload.amount, 10),
    payload.description || '',
    'Pending',
    payload.createdDate || '',
    payload.createdTime || '',
    '',          // completedDate
    '',          // completedTime
    now,         // lastUpdated
    isoTs,       // isoTimestamp (creation time, immutable)
  ];

  sheet.appendRow(row);
  logAction('CREATE_REQUEST', payload.userMode || 'sender', payload.requestId);

  return rowToRequest(row);
}

function updateRequest(payload) {
  validateRequired(payload.requestId, 'requestId');

  var sheet = getSheet('Requests');
  var rowIndex = findRequestRow(sheet, payload.requestId);

  if (rowIndex === -1) {
    throw { message: 'Request not found', code: 404 };
  }

  // Fetch exactly 1 row, all columns
  var row = sheet.getRange(rowIndex, 1, 1, NUM_REQUEST_COLS).getValues()[0];

  if (payload.status !== undefined) {
    if (!validateStatus(payload.status)) {
      throw { message: 'Invalid status', code: 400 };
    }
    row[4] = payload.status;
  }

  if (payload.description !== undefined) {
    if (!validateDescription(payload.description)) {
      throw { message: 'Description too long', code: 400 };
    }
    row[3] = payload.description;
  }

  if (payload.status === 'Completed') {
    row[7] = payload.completedDate || row[7];
    row[8] = payload.completedTime || row[8];
  }

  row[9] = new Date().toISOString(); // lastUpdated
  // row[10] (isoTimestamp) never changes

  sheet.getRange(rowIndex, 1, 1, NUM_REQUEST_COLS).setValues([row]);
  logAction('UPDATE_REQUEST', payload.userMode || 'receiver',
    payload.requestId + ' -> ' + (payload.status || 'desc updated'));

  return rowToRequest(row);
}

function deleteRequest(requestId, userMode) {
  validateRequired(requestId, 'requestId');

  var sheet = getSheet('Requests');
  var rowIndex = findRequestRow(sheet, requestId);

  if (rowIndex === -1) {
    throw { message: 'Request not found', code: 404 };
  }

  sheet.deleteRow(rowIndex);
  logAction('DELETE_REQUEST', userMode, requestId);
}
