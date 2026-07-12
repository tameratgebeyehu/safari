module.exports = {
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testMatch: ['<rootDir>/src/**/__tests__/**/*.test.{ts,tsx,js,jsx}'],
  transform: {
    '^.+\\.(ts|tsx)$': 'babel-jest',
    '^.+\\.(js|jsx)$': 'babel-jest',
  },
  transformIgnorePatterns: [
    'node_modules/(?!(jest-)?react-native|@react-native|@react-native-async-storage|@react-native-community|expo-.*|react-native-gesture-handler|react-native-paper|react-native-safe-area-context|react-native-screens|react-native-vector-icons|@tanstack|i18next|react-i18next)/',
  ],
};
