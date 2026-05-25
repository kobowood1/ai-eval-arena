/**
 * KEK/DEK pattern for API key encryption.
 *
 * Each user gets a random Data Encryption Key (DEK).
 * The DEK is wrapped (encrypted) with a random Key Encryption Key (KEK).
 * Both the wrapped DEK and the KEK are stored server-side per user.
 * To decrypt user data: load KEK → unwrap DEK → decrypt ciphertext.
 *
 * This avoids a single shared master secret while keeping key rotation simple:
 * re-wrap the DEK with a new KEK, no need to re-encrypt all user data.
 */

const ALG = 'AES-GCM';
const KEY_LEN = 256;
const IV_LEN = 12; // 96-bit IV recommended for AES-GCM

function subtle(): SubtleCrypto {
  if (typeof globalThis.crypto?.subtle === 'undefined') {
    throw new Error('Web Crypto API not available in this environment');
  }
  return globalThis.crypto.subtle;
}

export async function generateKey(): Promise<CryptoKey> {
  return subtle().generateKey({ name: ALG, length: KEY_LEN }, true, ['encrypt', 'decrypt']);
}

export async function exportKey(key: CryptoKey): Promise<Uint8Array<ArrayBuffer>> {
  const raw = await subtle().exportKey('raw', key);
  return new Uint8Array(raw as ArrayBuffer);
}

export async function importKey(raw: Uint8Array<ArrayBuffer>): Promise<CryptoKey> {
  return subtle().importKey('raw', raw, { name: ALG, length: KEY_LEN }, true, ['encrypt', 'decrypt']);
}

export interface Ciphertext {
  iv: Uint8Array<ArrayBuffer>;
  data: Uint8Array<ArrayBuffer>;
}

export async function encrypt(key: CryptoKey, plaintext: Uint8Array<ArrayBuffer>): Promise<Ciphertext> {
  const iv = globalThis.crypto.getRandomValues(new Uint8Array(IV_LEN));
  const cipherBuf = await subtle().encrypt({ name: ALG, iv }, key, plaintext);
  return { iv, data: new Uint8Array(cipherBuf as ArrayBuffer) };
}

export async function decrypt(key: CryptoKey, ct: Ciphertext): Promise<Uint8Array<ArrayBuffer>> {
  const plainBuf = await subtle().decrypt({ name: ALG, iv: ct.iv }, key, ct.data);
  return new Uint8Array(plainBuf as ArrayBuffer);
}

/** Encrypt an API key string, returning base64-encoded iv and ciphertext. */
export async function encryptApiKey(
  dek: CryptoKey,
  apiKey: string,
): Promise<{ iv: string; ciphertext: string }> {
  const enc = new TextEncoder();
  const plain = enc.encode(apiKey);
  const { iv, data } = await encrypt(dek, new Uint8Array(plain.buffer as ArrayBuffer));
  return {
    iv: Buffer.from(iv).toString('base64'),
    ciphertext: Buffer.from(data).toString('base64'),
  };
}

/** Decrypt an API key string from base64-encoded iv and ciphertext. */
export async function decryptApiKey(
  dek: CryptoKey,
  iv: string,
  ciphertext: string,
): Promise<string> {
  const dec = new TextDecoder();
  const ivBuf = Buffer.from(iv, 'base64');
  const dataBuf = Buffer.from(ciphertext, 'base64');
  const plaintext = await decrypt(dek, {
    iv: new Uint8Array(ivBuf.buffer.slice(ivBuf.byteOffset, ivBuf.byteOffset + ivBuf.byteLength) as ArrayBuffer),
    data: new Uint8Array(dataBuf.buffer.slice(dataBuf.byteOffset, dataBuf.byteOffset + dataBuf.byteLength) as ArrayBuffer),
  });
  return dec.decode(plaintext);
}

/** Generate a fresh KEK + DEK pair for a new user. Returns raw bytes for storage. */
export async function generateUserKeys(): Promise<{
  kekRaw: Uint8Array<ArrayBuffer>;
  dekRaw: Uint8Array<ArrayBuffer>;
  wrappedDek: Ciphertext;
}> {
  const kek = await generateKey();
  const dek = await generateKey();
  const kekRaw = await exportKey(kek);
  const dekRaw = await exportKey(dek);
  const wrappedDek = await encrypt(kek, dekRaw);
  return { kekRaw, dekRaw, wrappedDek };
}

/** Given a stored KEK (raw bytes) and wrapped DEK, recover the DEK as a CryptoKey. */
export async function unwrapDek(kekRaw: Uint8Array<ArrayBuffer>, wrappedDek: Ciphertext): Promise<CryptoKey> {
  const kek = await importKey(kekRaw);
  const dekRaw = await decrypt(kek, wrappedDek);
  return importKey(dekRaw);
}
