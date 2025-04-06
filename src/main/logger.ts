export function log(...params: unknown[]) {
  if (!process.env.LOG_LEVEL) {
    return;
  }
  console.log(...params);
}