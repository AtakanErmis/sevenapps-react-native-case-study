module.exports = {
  preset: 'jest-expo',
  setupFilesAfterEnv: ['<rootDir>/jest-setup.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg|nativewind)(?!.*react-native-css-interop)',
  ],
  collectCoverage: true,
  collectCoverageFrom: [
    '**/*.{ts,tsx}',
    '!**/coverage/**',
    '!**/node_modules/**',
    '!**/babel.config.js',
    '!**/expo-env.d.ts',
    '!**/.expo/**',
    '!**/jest-setup.ts',
    '!**/app-env.d.ts',
    '!**/drizzle.config.ts',
    '!**/nativewind-env.d.ts',
    '!**/types.ts',
  ],
  transform: {
    '^.+\\.(js|ts|tsx)$': [
      'babel-jest',
      {
        presets: [['babel-preset-expo']],
        plugins: [['inline-import', { extensions: ['.sql'] }]],
      },
    ],
  },
};
