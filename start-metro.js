const Metro = require('metro');
const path = require('path');

async function main() {
  const config = await Metro.loadConfig({ cwd: process.cwd(), resetCache: true });
  config.server.port = 8081;
  const server = await Metro.runServer(config, { port: 8081 });
  console.log('Metro running on port 8081');
  process.on('SIGINT', () => { server.close(); process.exit(0); });
  process.on('SIGTERM', () => { server.close(); process.exit(0); });
}
main().catch(e => { console.error(e); process.exit(1); });
