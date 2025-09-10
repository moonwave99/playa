import prisma from "../main/db/prisma";
import {
  PrismockClientType,
  relationshipStore,
} from "prismock/build/main/lib/client";

export async function clearPrisma() {
  await (prisma as PrismockClientType).reset();
  relationshipStore.resetValues();
}
