import CryptoJS from 'crypto-js';

const getEncryptionKey = () => {
  const key = process.env.ENCRYPTION_KEY;
  if (!key) {
    throw new Error('ENCRYPTION_KEY environment variable is not set');
  }
  return key;
};

export function encrypt(text: string): string {
  const key = getEncryptionKey();
  return CryptoJS.AES.encrypt(text, key).toString();
}

export function decrypt(encryptedText: string): string {
  const key = getEncryptionKey();
  const bytes = CryptoJS.AES.decrypt(encryptedText, key);
  return bytes.toString(CryptoJS.enc.Utf8);
}

export function maskApiKey(key: string): string {
  if (!key || key.length < 8) return '••••••••';
  return `${key.slice(0, 4)}${'•'.repeat(Math.min(key.length - 8, 20))}${key.slice(-4)}`;
}
