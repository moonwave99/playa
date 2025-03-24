import { useState, useEffect } from "react";

export default function useDominantColor(url: string) {
  const [color, setColor] = useState({
    color: "black",
    useDarkText: false,
  });
  useEffect(() => {
    getDominantColor(url).then(setColor);
  }, [url]);
  return color;
}

function getDominantColor(url: string) {
  const image = new Image();
  image.crossOrigin = "";
  image.src = url;
  return new Promise((resolve) => {
    image.onload = () => {
      const context = document.createElement("canvas").getContext("2d");
      context.drawImage(image, 0, 0, 1, 1);
      const i = context.getImageData(0, 0, 1, 1).data;
      const HEX = ((1 << 24) + (i[0] << 16) + (i[1] << 8) + i[2])
        .toString(16)
        .slice(1);
      resolve({
        color: `#${HEX}`,
        useDarkText: isTextDark(`#${HEX}`),
      });
    };
  });
}

// see: https://stackoverflow.com/a/41491220/1073758
function isTextDark(hex: string) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) {
    return false;
  }

  const r = parseInt(result[1], 16);
  const g = parseInt(result[2], 16);
  const b = parseInt(result[3], 16);

  const colors = [r / 255, g / 255, b / 255];
  const c = colors.map((color) => {
    if (color <= 0.03928) {
      return color / 12.92;
    }
    return Math.pow((color + 0.055) / 1.055, 2.4);
  });
  const luminance = (0.2126 * c[0]) + (0.7152 * c[1]) + (0.0722 * c[2]);
  return luminance > 0.179;
}
