import prisma from "../main/db/prisma";
import {
  PrismockClientType,
  relationsStore,
} from "prismock/build/main/lib/client";

export async function clearPrisma() {
  await (prisma as PrismockClientType).reset();
  relationsStore.resetValues();
}
