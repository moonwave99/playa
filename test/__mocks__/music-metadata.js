const fixtures = require('../testFixtures');

module.exports = {
  parseFile: async (path, options = {}) => {
    const track = fixtures.tracks.find(x => x.path === path);
    if (!track) {
      throw new Error(`${path} not found`);
    }
    const { title, artist, number, duration } = track;
    const album = track.artist === 'My Bloody Valentine' ? 'Loveless' : '';
    return {
      format: {
        duration
      },
      common: {
        title,
        artist,
        album,
        track: {
          no: number
        }
      }
    };
  }
}
