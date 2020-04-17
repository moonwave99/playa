const stickybits = require('stickybits');
const prismjs = require('prismjs');
require('prismjs/components/prism-typescript');
require('prismjs/components/prism-jsx');
require('prismjs/components/prism-tsx');
require('prismjs/components/prism-yaml');

function shuffleArray(array) {
  const copy = array.slice(0);
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function fillAlbumBar({
  element,
  observer,
  images
}) {
  const randomisedImages = shuffleArray(images);
  const { width, height } = element.getBoundingClientRect();
  const albumWidth = height;
  const screenAlbumRatio = window.screen.width / albumWidth;
  const albumCount = Math.ceil(screenAlbumRatio);
  const offset = albumCount - screenAlbumRatio;

  for (let i = 0; i < albumCount; i++) {
    const album = document.createElement('div');
    album.classList.add('album', 'absolute', 'h-100');

    album.style.top = 0;
    album.style.width = `${albumWidth}px`;
    album.style.transform = `translateX(${(i - offset / 2) * albumWidth}px)`;
    const img = document.createElement('img');
    img.onload = () => img.classList.add('loaded');
    img.src = randomisedImages[i % images.length];
    album.appendChild(img);

    element.appendChild(album);
    observer.observe(album);
  }
}

const defaultOptions = {
  hero: {
    interval: 5000
  }
};

module.exports = function(_options){
  window.addEventListener('load', async () => {
    const options = {...defaultOptions, ..._options};
    console.log('App started!', options);

    stickybits('.navigation', { useStickyClasses: true });

    const observer = new IntersectionObserver((entries, observer) => {
      entries.forEach(({ isIntersecting, target }) => {
        if (!isIntersecting) {
          return;
        }
        setTimeout(() =>target.classList.add('loaded'), Math.random() * 500);
      });
    });

    document
      .querySelectorAll('.album-bar')
      .forEach(element => fillAlbumBar({
        element,
        observer,
        images: [...Array(10).keys()].map(i => `${options.basePath}/images/albums/${i}.jpg`)
      }));

    const $screenshots = document.querySelectorAll('.hero-screenshots img');
    $screenshots.forEach(img => {
      img.onload = () => img.classList.add('loaded');
      img.src = img.dataset.src
    });

    let currentScreenshotIndex = 0;
    setInterval(() => {
      $screenshots.forEach((el, index) => el.classList.toggle('loaded', index === currentScreenshotIndex));
      currentScreenshotIndex = (currentScreenshotIndex + 1) % $screenshots.length;
    }, options.hero.interval);
  });
};
