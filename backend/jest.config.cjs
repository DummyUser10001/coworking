module.exports = {
  transform: {
    '^.+\\.js$': 'babel-jest',
  },
  transformIgnorePatterns: [
    '/node_modules/(?!bcryptjs|jsonwebtoken)', // Add more ESM packages here if needed
  ],
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'], // If you want to auto-run your setup.js
};