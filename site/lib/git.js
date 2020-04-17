const git = require('git-rev-sync');

module.exports = {
  rev:    git.short(),
  branch: git.branch()
}
