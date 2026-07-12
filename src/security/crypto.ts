import * as Crypto from 'expo-crypto';

export async function sha256(input: string): Promise<string> {
  return Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, input);
}

export function randomUUID(): string {
  return Crypto.randomUUID();
}

export async function generateNonce(): Promise<{ nonce: string; timestamp: number }> {
  const uuid = randomUUID();
  const timestamp = Date.now();
  const hash = await sha256(uuid + timestamp.toString(16));
  return { nonce: hash.slice(0, 16), timestamp };
}

export async function hashWithSecret(input: string, secret: string): Promise<string> {
  return sha256(secret + input + secret);
}

export function getRandomInt(min: number, max: number): number {
  const range = max - min + 1;
  const randomBytes = Crypto.getRandomBytes(4);
  const view = new DataView(randomBytes.buffer, randomBytes.byteOffset, randomBytes.byteLength);
  const value = view.getUint32(0, true);
  return min + (value % range);
}
