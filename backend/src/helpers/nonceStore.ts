const usedNonces = new Set<string>();

const NONCE_TTL = 5 * 60 * 1000; // 5 minutos

export const registerNonce = (nonce: string): void => {
  usedNonces.add(nonce);
  // Auto-limpiar el nonce después de 5 minutos
  setTimeout(() => {
    usedNonces.delete(nonce);
  }, NONCE_TTL);
};

export const isNonceUsed = (nonce: string): boolean => {
  return usedNonces.has(nonce);
};
