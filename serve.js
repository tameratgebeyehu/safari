const Metro = require('metro');
const { getConfig } = require('@expo/config');
const { getDefaultConfig } = require('@expo/metro-config');
const { withMetroMultiPlatformAsync } = require('@expo/cli/build/src/start/server/metro/withMetroMultiPlatform');
const { getPlatformBundlers } = require('@expo/cli/build/src/start/server/platformBundlers');

(async () => {
  const projectRoot = process.cwd();
  const { loadConfig } = require('metro-config');
  let config = await loadConfig({ cwd: projectRoot, projectRoot });
  const { exp } = getConfig(projectRoot, { skipSDKVersionRequirement: true });
  const platformBundlers = getPlatformBundlers(projectRoot, exp);
  config = await withMetroMultiPlatformAsync(projectRoot, {
    config, exp, platformBundlers,
    isTsconfigPathsEnabled: true, isFastResolverEnabled: false,
    isExporting: false, isReactCanaryEnabled: false,
    isNamedRequiresEnabled: false, isReactServerComponentsEnabled: false,
    getMetroBundler: () => null,
  });
  config.server.port = 8081;
  config.watchFolders = [projectRoot];
  await Metro.runServer(config, { port: 8081, watch: true });
  console.log('OK: http://localhost:8081');
})().catch(e => { console.error(e); process.exit(1); });
