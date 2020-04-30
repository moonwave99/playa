module.exports = {
  roots: [
    "<rootDir>/e2e/tests"
  ],
  testMatch: [
    "**/?(*.)+(test).+(ts|tsx|js)"
  ],
  transform: {
    "^.+\\.(ts|tsx)$": "ts-jest"
  }
}
