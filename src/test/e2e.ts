import path from "node:path";

export const IS_E2E_TEST = process.env.npm_lifecycle_event === "test:e2e";

export function getE2ETmpPath(id: string) {
  return path.join(process.cwd(), "e2e-tests", "_tmp", id);
}

type getE2EFolderPathParams = {
  key: string;
  testId: string;
  testTitle: string;
};

export function getE2EFolderPath({
  key,
  testId,
  testTitle,
}: getE2EFolderPathParams) {
  if (testTitle === "Relocate Release Folder") {
    return [
      path.join(
        getE2ETmpPath(testId),
        "LIBRARY_PATH",
        "A",
        "Artist 1",
        "[Album]",
        "2000 - New Folder"
      ),
    ];
  }
  if (key !== "importFolderPath") {
    return [path.join(getE2ETmpPath(testId), key)];
  }
  if (["Import Single", "Onboarding Complete"].includes(testTitle)) {
    return [
      path.join(
        getE2ETmpPath(testId),
        "LIBRARY_PATH",
        "A",
        "Artist 1",
        "[Album]",
        "2000 - Album 1"
      ),
    ];
  }
  if (testTitle === "Import Various") {
    return Array.from({ length: 2 }, (_, i) =>
      path.join(
        getE2ETmpPath(testId),
        "LIBRARY_PATH",
        "Various Artists",
        "[Album]",
        `2000 - Album ${i + 1}`
      )
    );
  }
  if (testTitle === "Import Multiple") {
    return Array.from({ length: 2 }, (_, i) =>
      path.join(
        getE2ETmpPath(testId),
        "LIBRARY_PATH",
        "A",
        "Artist 1",
        "[Album]",
        `2000 - Album ${i + 1}`
      )
    );
  }
  if (testTitle === "Import Group") {
    return Array.from({ length: 2 }, (_, i) =>
      path.join(
        getE2ETmpPath(testId),
        "LIBRARY_PATH",
        "A",
        "Artist 1",
        "[Album]",
        `2000 - Album 1 CD${i + 1}`
      )
    );
  }
  return [path.join(getE2ETmpPath(testId), "LIBRARY_PATH")];
}
