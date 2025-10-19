import { removeDb } from "../src/test/seed";

export default async function teardown() {
  await removeDb("test");
}
