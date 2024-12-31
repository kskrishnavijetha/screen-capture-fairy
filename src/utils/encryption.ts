/**
 * Utility functions for encrypting and decrypting recordings using Web Crypto API
 */

export async function generateEncryptionKey(password: string): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const passwordBuffer = encoder.encode(password);
  
  // Generate a key from the password
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    passwordBuffer,
    'PBKDF2',
    false,
    ['deriveBits', 'deriveKey']
  );
  
  // Use PBKDF2 to derive a key
  return await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: encoder.encode('secure-recording-salt'),
      iterations: 100000,
      hash: 'SHA-256'
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  );
}

export async function encryptBlob(blob: Blob, key: CryptoKey): Promise<{ encryptedData: ArrayBuffer, iv: Uint8Array }> {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const arrayBuffer = await blob.arrayBuffer();
  
  const encryptedData = await crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: iv
    },
    key,
    arrayBuffer
  );
  
  return { encryptedData, iv };
}

export async function decryptData(encryptedData: ArrayBuffer, key: CryptoKey, iv: Uint8Array): Promise<ArrayBuffer> {
  return await crypto.subtle.decrypt(
    {
      name: 'AES-GCM',
      iv: iv
    },
    key,
    encryptedData
  );
}

export function saveEncryptedRecording(encryptedData: ArrayBuffer, iv: Uint8Array, filename: string) {
  // Combine IV and encrypted data
  const combinedData = new Uint8Array(iv.length + encryptedData.byteLength);
  combinedData.set(iv);
  combinedData.set(new Uint8Array(encryptedData), iv.length);
  
  // Store in localStorage (you might want to use IndexedDB for larger files)
  localStorage.setItem(`recording-${filename}`, JSON.stringify({
    data: Array.from(combinedData),
    timestamp: new Date().toISOString()
  }));
}

export function getStoredRecordings(): string[] {
  return Object.keys(localStorage)
    .filter(key => key.startsWith('recording-'))
    .map(key => key.replace('recording-', ''));
}

export async function getDecryptedRecording(filename: string, password: string): Promise<Blob | null> {
  const storedData = localStorage.getItem(`recording-${filename}`);
  if (!storedData) return null;
  
  const { data } = JSON.parse(storedData);
  const combinedData = new Uint8Array(data);
  
  // Extract IV and encrypted data
  const iv = combinedData.slice(0, 12);
  const encryptedData = combinedData.slice(12);
  
  try {
    const key = await generateEncryptionKey(password);
    const decryptedData = await decryptData(encryptedData.buffer, key, iv);
    return new Blob([decryptedData], { type: 'video/webm' });
  } catch (error) {
    console.error('Failed to decrypt recording:', error);
    return null;
  }
}