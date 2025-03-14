const crypto = require('crypto');

// Generate a random key (32 bytes for AES-256)
const secretKey = crypto.randomBytes(32);

// Create a random IV (16 bytes for AES)
const iv = crypto.randomBytes(16);

// Encryption function
function encrypt(text) {
  const cipher = crypto.createCipheriv('aes-256-cbc', secretKey, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return { iv: iv.toString('hex'), encryptedData: encrypted };
}

// Decryption function
function decrypt(encryptedData, iv) {
  const decipher = crypto.createDecipheriv('aes-256-cbc', secretKey, Buffer.from(iv, 'hex'));
  let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

// Example usage
const text = "Hello, world!";
const encrypted = encrypt(text);
console.log("Encrypted:", encrypted);

const decrypted = decrypt(encrypted.encryptedData, encrypted.iv);
console.log("Decrypted:", decrypted);
