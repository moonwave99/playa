import prisma from "../main/db/prisma";
import {
  PrismockClientType,
  relationshipStore,
} from "@moonwave99/prismock/build/main/lib/client";

export async function clearPrisma() {
  await (prisma as PrismockClientType).reset();
  relationshipStore.resetValues();
}
