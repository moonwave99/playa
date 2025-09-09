import { seed } from "@/test/seed";
import { clearPrisma } from "@/test/prisma-utils";
import { mockFs } from "@/test/mock-fs";
import { withoutDates } from "@/test/utils";
import { importExportController } from "./importExport";
import { Open } from "unzipper";
import path from "node:path";
import { readJSON } from "fs-extra";

afterEach(clearPrisma);

describe("exportDataFromDialog function", () => {
  it("exports current data to a zip archive", async (context) => {
    const seeded = await seed();
    const directory = await mockFs(
      {
        Desktop: {
          dumpFolder: {},
        },
        UserData: {},
      },
      context.task.id
    );

    const userDataPath = path.join(directory, "UserData");

    const send = vi.fn();
    const openFileDialog = vi.fn();
    const openFolderDialog = () => [path.join(directory, "Desktop/dumpFolder")];

    const { exportDataFromDialog } = importExportController({
      openFolderDialog,
      openFileDialog,
      desktopPath: path.join(directory, "Desktop"),
      userDataPath,
      appVersion: "0.5",
      send,
    });

    const zipPath = await exportDataFromDialog();

    const unzipped = await Open.file(zipPath);
    const tempPath = path.join(userDataPath, "imports", path.basename(zipPath));
    await unzipped.extract({ path: tempPath });

    await Promise.all(
      ["artists", "releases", "tracks", "collections", "groups"].map(
        async (entity: keyof typeof seeded) => {
          const exported = await readJSON(
            path.join(tempPath, `${entity}.json`)
          );
          expect(exported.map(withoutDates)).toMatchObject(
            seeded[entity].map(withoutDates)
          );
        }
      )
    );
  });
});
