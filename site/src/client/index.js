import stickybits from "stickybits";
import "prismjs";

import "prismjs/components/prism-typescript.js";
import "prismjs/components/prism-jsx.js";
import "prismjs/components/prism-tsx.js";
import "prismjs/components/prism-yaml.js";

function init(_options) {
  const albums = [
    "The Smiths - Meat is Murder",
    "Low - I Could Die in Hope",
    "Gustavo Cerati - Bocanada",
    "Dirty Three - Ocean Songs",
    "Slowdive - Outside Your Room EP",
    "This Mortal Coil - It'll End in Tears",
    "My Bloody Valentine - You Made Me Realise EP",
    "Ecstasy Of Saint Theresa - Pigment",
    "Alice in Chains - Jar of Flies",
    "Swans - White Light From The Mouth Of Infinity",
  ];

  function shuffleArray(array) {
    const copy = [...array];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }

  function fillAlbumBar({ element, observer, images }) {
    const randomisedImages = shuffleArray(images);
    const { height: albumWidth } = element.getBoundingClientRect();
    const screenAlbumRatio = window.screen.width / albumWidth;
    const albumCount = Math.ceil(screenAlbumRatio);
    const offset = albumCount - screenAlbumRatio;

    for (let i = 0; i < albumCount; i++) {
      const album = document.createElement("div");
      album.classList.add("album", "absolute", "h-100");

      album.style.top = 0;
      album.style.width = `${albumWidth}px`;
      album.style.transform = `translateX(${(i - offset / 2) * albumWidth}px)`;

      const { src, alt } = randomisedImages[i % images.length];

      const img = document.createElement("img");
      img.onload = () => img.classList.add("loaded");
      img.src = src;
      img.alt = alt;
      img.title = alt;
      album.appendChild(img);

      element.appendChild(album);
      observer.observe(album);
    }
  }

  const defaultOptions = {
    basePath: "http://localhost:9000",
    hero: {
      interval: 5000,
    },
  };

  window.addEventListener("load", async () => {
    const options = { ...defaultOptions, ..._options };
    console.log("App started!", options);

    stickybits(".navigation", { useStickyClasses: true });

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(({ isIntersecting, target }) => {
        if (!isIntersecting) {
          return;
        }
        setTimeout(() => target.classList.add("loaded"), Math.random() * 500);
      });
    });

    document.querySelectorAll(".album-bar").forEach((element) =>
      fillAlbumBar({
        element,
        observer,
        images: albums.map((alt, i) => ({
          src: `${options.basePath}/images/albums/${i}.jpg`,
          alt,
        })),
      })
    );

    const $screenshots = document.querySelectorAll(".hero-screenshots img");
    $screenshots.forEach((img) => {
      img.onload = () => img.classList.add("loaded");
      img.src = img.dataset.src;
    });

    let currentScreenshotIndex = 0;
    setInterval(() => {
      $screenshots.forEach((el, index) =>
        el.classList.toggle("loaded", index === currentScreenshotIndex)
      );
      currentScreenshotIndex =
        (currentScreenshotIndex + 1) % $screenshots.length;
    }, options.hero.interval);
  });
}

window.init = init;
