let fallbackBlockIdCounter = 0;

export function createBlockId() {
  const randomId = globalThis.crypto?.randomUUID?.();
  if (randomId) {
    return randomId;
  }

  fallbackBlockIdCounter += 1;
  return `block-${Date.now()}-${fallbackBlockIdCounter}`;
}
