class Client {
  constructor() {

  }
  database() {
    return {
      search: ({ artist, title }) => ({
        results: artist === 'Slowdive' ? [{
          cover_image: 'https://url/to/slowdive-album.jpg'
        }] : []
      }),
      getImage: (url) => {
        if (url === 'https://url/to/slowdive-album.jpg') {
          return 'data';
        } else if (url === 'https://path/to/covers/1.jpg') {
          return '/path/to/covers/1.jpg';
        }
        return null;
      }
    };
  }
};

module.exports = { Client };
