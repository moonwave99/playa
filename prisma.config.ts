import path from "node:path";
import type { PrismaConfig } from "prisma";

const DB_PATH = "./src/main/db";

export default {
  schema: path.join(DB_PATH, "schema.prisma"),
  migrations: {
    path: path.join(DB_PATH, "migrations"),
  },
} satisfies PrismaConfig;
