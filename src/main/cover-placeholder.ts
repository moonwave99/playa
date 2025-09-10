import { toSvg } from "jdenticon";

export function getCoverPlaceholder(url: string) {
  const img = toSvg(url.replace("playa://", "").replace("-cover.jpg", ""), 200);
  return new Response(img, {
    headers: {
      "Content-Type": "image/svg+xml",
      "Content-Length": `${img.length}`,
    },
  });
}
