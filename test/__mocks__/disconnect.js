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
        }
        return null;
      }
    };
  }
};

module.exports = { Client };
