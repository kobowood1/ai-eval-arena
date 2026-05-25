import { describe, it, expect } from 'vitest';
import {
  generateKey,
  exportKey,
  importKey,
  encrypt,
  decrypt,
  encryptApiKey,
  decryptApiKey,
  generateUserKeys,
  unwrapDek,
} from './crypto.js';

describe('crypto', () => {
  it('round-trips raw encrypt/decrypt', async () => {
    const key = await generateKey();
    const plain = new TextEncoder().encode('hello arena');
    const ct = await encrypt(key, plain);
    const recovered = await decrypt(key, ct);
    expect(new TextDecoder().decode(recovered)).toBe('hello arena');
  });

  it('uses a fresh IV each call', async () => {
    const key = await generateKey();
    const plain = new TextEncoder().encode('same plaintext');
    const ct1 = await encrypt(key, plain);
    const ct2 = await encrypt(key, plain);
    expect(Buffer.from(ct1.iv).toString('hex')).not.toBe(Buffer.from(ct2.iv).toString('hex'));
  });

  it('fails to decrypt with wrong key', async () => {
    const key = await generateKey();
    const wrongKey = await generateKey();
    const ct = await encrypt(key, new TextEncoder().encode('secret'));
    await expect(decrypt(wrongKey, ct)).rejects.toThrow();
  });

  it('round-trips exportKey / importKey', async () => {
    const key = await generateKey();
    const raw = await exportKey(key);
    const imported = await importKey(raw);
    const plain = new TextEncoder().encode('key export test');
    const ct = await encrypt(key, plain);
    const recovered = await decrypt(imported, ct);
    expect(new TextDecoder().decode(recovered)).toBe('key export test');
  });

  it('round-trips encryptApiKey / decryptApiKey', async () => {
    const key = await generateKey();
    const apiKey = 'sk-ant-api03-supersecret';
    const { iv, ciphertext } = await encryptApiKey(key, apiKey);
    const recovered = await decryptApiKey(key, iv, ciphertext);
    expect(recovered).toBe(apiKey);
  });

  it('generateUserKeys produces usable KEK/DEK pair', async () => {
    const { kekRaw, wrappedDek } = await generateUserKeys();
    const dek = await unwrapDek(kekRaw, wrappedDek);
    const apiKey = 'sk-test-key';
    const { iv, ciphertext } = await encryptApiKey(dek, apiKey);
    const recovered = await decryptApiKey(dek, iv, ciphertext);
    expect(recovered).toBe(apiKey);
  });
});
