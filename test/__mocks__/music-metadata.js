const fixtures = require('../testFixtures');

module.exports = {
  parseFile: async (path, options = {}) => {
    const track = fixtures.tracks.find(x => x.path === path);
    if (!track) {
      throw new Error(`${path} not found`);
    }
    const { title, artist, number, duration } = track;
    return {
      format: {
        duration
      },
      common: {
        title,
        artist,
        track: {
          no: number
        }
      }
    };
  }
}
