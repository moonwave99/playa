import { getCoverPlaceholder } from "./cover-placeholder";

describe("getCoverPlaceholder", () => {
  it("returns an svg placeholder", async () => {
    const placeholder = getCoverPlaceholder(
      "playa://ee1478c38c24f36e-cover.jpg"
    );
    expect(placeholder.headers.get("Content-Type")).toBe("image/svg+xml");
  });

  it("returns different placeholders for different releases", async () => {
    const placeholders = [
      "playa://ee1478c38c24f36e-cover.jpg",
      "playa://4af3d5d9da84e183-cover.jpg",
    ].map(getCoverPlaceholder);

    expect(await placeholders[0].text()).not.toBe(await placeholders[1].text());
  });
});
