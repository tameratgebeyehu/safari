/**
 * Safari A - Validation utilities
 */

var VALID_STATUSES = ['Pending', 'Processing', 'Completed', 'Cancelled'];

function validatePhone(phone) {
  if (!phone) return false;
  var normalized = String(phone).replace(/\D/g, '');
  if (normalized.indexOf('251') === 0 && normalized.length === 12) {
    normalized = '0' + normalized.slice(3);
  }
  if (normalized.indexOf('9') === 0 && normalized.length === 9) {
    normalized = '0' + normalized;
  }
  return /^09\d{8}$/.test(normalized);
}

function normalizePhone(phone) {
  var normalized = String(phone).replace(/\D/g, '');
  if (normalized.indexOf('251') === 0 && normalized.length === 12) {
    return '0' + normalized.slice(3);
  }
  if (normalized.indexOf('9') === 0 && normalized.length === 9) {
    return '0' + normalized;
  }
  if (normalized.indexOf('09') === 0 && normalized.length === 10) {
    return normalized;
  }
  return normalized;
}

function validateAmount(amount) {
  var num = parseInt(amount, 10);
  return !isNaN(num) && num > 0 && String(num) === String(amount).replace(/\D/g, '');
}

function validateDescription(description) {
  if (description === undefined || description === null) return true;
  return String(description).length <= 100;
}

function validateStatus(status) {
  return VALID_STATUSES.indexOf(status) !== -1;
}

function validateRequired(value, fieldName) {
  if (value === undefined || value === null || String(value).trim() === '') {
    throw { message: fieldName + ' is required', code: 400 };
  }
}
