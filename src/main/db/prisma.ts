/* eslint-disable @typescript-eslint/no-explicit-any */
import { PrismaClient } from "@prisma/client-generated";
import path from "node:path";

import { IS_E2E_TEST } from "@/test/utils";

function getUrl() {
  const { NODE_ENV, testId } = process.env;
  if (NODE_ENV === "test") {
    return "";
  }
  if (NODE_ENV === "development") {
    return "file:data.db";
  }
  if (IS_E2E_TEST) {
    const dbName = testId ? `data-${testId}.db` : "data.db";
    return `file:${path.join(
      process.cwd(),
      `out/Playa-darwin-arm64/Playa.app/Contents/Resources/${dbName}`
    )}`;
  }
  return `file:${path.join(process.resourcesPath, "data.db")}`;
}

function getPrisma() {
  return typeof window === "undefined"
    ? new PrismaClient({
        datasources: {
          db: {
            url: getUrl(),
          },
        },
      })
    : null;
}

const prisma = (global as any).prisma || getPrisma();

if (process.env.NODE_ENV === "development") {
  (global as any).prisma = prisma;
}

export default prisma as PrismaClient;
