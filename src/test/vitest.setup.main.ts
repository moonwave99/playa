import { afterEach } from "vitest";
import path from "path";
import { mockFsCleanup } from "./mock-fs";
import type { PrismaClient } from "@prisma/client";
import { createPrismock } from "prismock";
import { clearPrisma } from "./prisma-utils";

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
      getPath: vi.fn(),
    },
    Menu: {
      setApplicationMenu: vi.fn(),
      getApplicationMenu: vi.fn(() => ({
        append: vi.fn(),
      })),
    },
    MenuItem: vi.fn(),
    ipcMain: {
      handle: vi.fn(),
      on: vi.fn(),
    },
  };
});

vi.mock("music-metadata", () => ({
  parseFile: async (filePath: string) => {
    const index = parseInt(path.basename(filePath).split("-").at(0));
    return Promise.resolve({
      common: {
        title: `Track ${index}`,
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
  await mockFsCleanup(context.task.id);
  clearPrisma();
});

afterEach(async (context) => {
  await mockFsCleanup(context.task.id);
});
