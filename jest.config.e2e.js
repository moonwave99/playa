module.exports = {
  roots: [
    "<rootDir>/test-e2e"
  ],
  testMatch: [
    "**/?(*.)+(test).+(ts|tsx|js)"
  ],
  transform: {
    "^.+\\.(ts|tsx)$": "ts-jest"
  }
}
