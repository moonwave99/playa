export function getCoverPlaceholder(url: string) {
  const img = Buffer.from(createPixelGIF(getColorFromURL(url)), "base64");
  return new Response(img, {
    headers: {
      "Content-Type": "image/gif",
      "Content-Length": `${img.length}`,
    },
  });
}

const colors = [
  "#70163C",
  "#3B429F",
  "#26F0F1",
  "#DCF763",
  "#FDE74C",
  "#DB5461",
  "#6CC551",
  "#BFD7EA",
  "#004FFF",
  "#EA2B1F",
];

function getColorFromURL(url: string) {
  const hash = url.replace("playa-cover://", "").replace("-cover.jpg", "");
  const index =
    hash.split("").reduce((memo, item) => (memo += item.charCodeAt(0)), 0) % 10;
  return colors[index];
}

const keyStr =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";

function createPixelGIF(hexColor: number | string) {
  return `R0lGODlhAQABAPAA${encodeHex(hexColor)}/yH5BAAAAAAALAAAAAABAAEAAAICRAEAOw==`;
}

function encodeHex(hexColor: number | string) {
  let rgb;
  if (typeof hexColor == "string") {
    let s = hexColor.substring(1, 7);
    if (s.length < 6) s = s[0] + s[0] + s[1] + s[1] + s[2] + s[2];
    rgb = [
      parseInt(s[0] + s[1], 16),
      parseInt(s[2] + s[3], 16),
      parseInt(s[4] + s[5], 16),
    ];
  } else
    rgb = [
      (hexColor & (0xff << 16)) >> 16,
      (hexColor & (0xff << 8)) >> 8,
      hexColor & 0xff,
    ];

  return encodeRGB(rgb[0], rgb[1], rgb[2]);
}

function encodeRGB(r = 0, g = 0, b = 0) {
  return encode_triplet(0, r, g) + encode_triplet(b, 255, 255);
}

function encode_triplet(e1 = 0, e2 = 0, e3 = 0) {
  const enc1 = e1 >> 2;
  const enc2 = ((e1 & 3) << 4) | (e2 >> 4);
  const enc3 = ((e2 & 15) << 2) | (e3 >> 6);
  const enc4 = e3 & 63;
  return (
    keyStr.charAt(enc1) +
    keyStr.charAt(enc2) +
    keyStr.charAt(enc3) +
    keyStr.charAt(enc4)
  );
}
