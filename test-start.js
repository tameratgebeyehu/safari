const { startAsync } = require('@expo/cli/build/src/start/startAsync');
const fs = require('fs');
const log = m => fs.appendFileSync('start-log.txt', new Date().toISOString() + ' ' + m + '\n');

log('Starting...');
process.env.EXPO_OFFLINE = '1';
process.env.EXPO_NO_TELEMETRY = '1';
process.env.NODE_ENV = 'development';

startAsync(process.cwd(), {
  port: 8081,
  clear: true,
  dev: true,
}, { webOnly: false })
  .then(() => log('SUCCESS'))
  .catch(e => log('ERROR: ' + e.message + '\n' + e.stack));
