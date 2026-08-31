module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jest-fixed-jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  testPathIgnorePatterns: ['/node_modules/', '/dist/'],
  moduleNameMapper: {
    '\\.svg\\?react$': '<rootDir>/__mocks__/svgrMock.js',
    '\\.(jpg|jpeg|png|gif|webp|svg)$': '<rootDir>/__mocks__/fileMock.js',

    '^.+\\.module\\.(css|sass|scss)$': 'identity-obj-proxy',
    '^.+\\.(css|sass|scss)$': '<rootDir>/__mocks__/styleMock.js',

    '^app/(.*)$': '<rootDir>/src/app/$1',
    '^pages/(.*)$': '<rootDir>/src/pages/$1',
    '^widgets/(.*)$': '<rootDir>/src/widgets/$1',
    '^features/(.*)$': '<rootDir>/src/features/$1',
    '^entities/(.*)$': '<rootDir>/src/entities/$1',
    '^shared/(.*)$': '<rootDir>/src/shared/$1',
  }
};
