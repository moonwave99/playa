/* eslint-disable @typescript-eslint/no-explicit-any */
import { PrismaClient } from "@prisma/client-generated";
import path from "node:path";

const url =
  process.env.NODE_ENV === "development"
    ? "file:data.db"
    : `file:${path.join(process.resourcesPath, "data.db")}`;

function getPrisma() {
  return typeof window === "undefined"
    ? new PrismaClient({
        datasources: {
          db: {
            url,
          },
        },
      })
    : null;
}

const prisma = (global as any).prisma || getPrisma();

if (process.env.NODE_ENV === "development") {
  (global as any).prisma = prisma;
}

export default prisma;
