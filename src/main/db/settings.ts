import { Settings } from "@/types/types";
import prisma from "./prisma";

export async function getSettings() {
  return prisma.settings.findFirstOrThrow();
}

export async function createSettings(settings: Omit<Settings, "id">) {
  return prisma.settings.create({
    data: settings,
  });
}

export async function updateSettings(settings: Omit<Settings, "id">) {
  return prisma.settings.updateMany({
    data: settings,
  });
}
