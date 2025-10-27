import { afterEach } from "vitest";
import path from "path";
import { testFsCleanup } from "@moonwave99/test-fs";
import type { PrismaClient } from "@prisma/client";
import { createPrismock } from "prismock";
import { clearPrisma } from "./prisma-utils";
import { parsePath } from "@/main/utils";

vi.mock("@prisma/client-generated", async () => {
  const actual = await vi.importActual<PrismaClient>(
    "@prisma/client-generated"
  );
  const PrismaClient = createPrismock(actual.Prisma);
  return {
    ...actual,
    PrismaClient,
  };
});

vi.mock("electron", () => {
  return {
    shell: {
      openPath: vi.fn(),
    },
    dialog: {
      showMessageBoxSync: vi.fn(),
      showOpenDialogSync: vi.fn((...args) => [args[1].defaultPath]),
    },
    app: {
      getPath: () => "",
      relaunch: vi.fn(),
      exit: vi.fn(),
    },
    protocol: {
      handle: vi.fn(),
    },
    Menu: {
      setApplicationMenu: vi.fn(),
      getApplicationMenu: vi.fn(() => ({
        append: vi.fn(),
      })),
    },
    MenuItem: vi.fn(),
    BrowserWindow: {
      getAllWindows: () => [] as unknown,
    },
    ipcMain: {
      handle: vi.fn(),
      on: vi.fn(),
    },
  };
});

vi.mock("music-metadata", () => ({
  parseFile: async (filePath: string) => {
    const { artist, title, year } = parsePath(
      filePath.split("LIBRARY_PATH").at(-1).split("/").slice(0, -1).join("/")
    );

    const index = parseInt(path.basename(filePath).split("-").at(0));
    return Promise.resolve({
      common: {
        artist: filePath.includes("Various") ? "Track Artist" : artist.name,
        title: `Track ${index}`,
        year: year || 1999,
        album: title,
        track: {
          no: index,
        },
      },
      format: {
        duration: 123,
      },
    });
  },
}));

beforeEach(async (context) => {
  await testFsCleanup(context.task.id);
  clearPrisma();
});

afterEach(async (context) => {
  await testFsCleanup(context.task.id);
});
