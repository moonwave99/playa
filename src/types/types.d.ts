import type { PrismaClient } from "@prisma/client";
import type { Api } from "@/preload";

declare module "*.module.css";

declare global {
  const MAIN_WINDOW_VITE_DEV_SERVER_URL: string | undefined;
  const MAIN_WINDOW_VITE_NAME: string | undefined;
  const prisma: PrismaClient | undefined;
  interface Window {
    api: Api;
  }
}
