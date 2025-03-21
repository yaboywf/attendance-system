const crypto = require('crypto');
const { param } = require('./server');

function createIv() {
	return crypto.randomBytes(16);
}

/**
	* Used to encrypt data
	* @param {string} text - The plain text data to be encrypted
	* @param {Buffer} key - The encryption / decryption key
	* @param {Buffer} iv - The initialization vector (IV) used for decryption
	* @returns {string} - The decrypted plaintext as a UTF-8 string.
*/

function encrypt(text, key, iv) {
	const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
	let encrypted = cipher.update(text, 'utf8', 'hex');
	encrypted += cipher.final('hex');
	return encrypted
}

/**
	* Used to decrypt data
	* @param {Buffer | string} encryptedData - The data to be decrypted
	* @param {Buffer} key - The encryption / decryption key
	* @param {Buffer} iv - The initialization vector (IV) used for decryption
	* @returns {string} - The decrypted plaintext as a UTF-8 string.
*/

function decrypt(encryptedData, key, iv) {
	const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
	let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
	decrypted += decipher.final('utf8');
	return decrypted
}

function getKey(password, salt) {
	return crypto.pbkdf2Sync(password, salt, 100000, 32, 'sha256');  // 100000 iterations, 32-byte key, 'sha256' hash
}

console.log(encrypt("student", getKey("123", "n39VriGNIkbYEhxfgPPupuMgVxPIucYOul73iLwSoTamb5uqjMcPa"), Buffer.from(
		"1fc055638a0e0fdddb1b881ea44f0226",
		'hex'
	)
))

// decrypt(
// 	"301c78344fbf85caf325dc96dc45e5e9",
// 	getKey(
// 		"123",
// 		"n39VriGNIkbYEhxfgPPupuMgVxPIucYOul73iLwSoTamb5uqjMcPa"
// 	),
// 	Buffer.from(
// 		"1fc055638a0e0fdddb1b881ea44f0226",
// 		'hex'
// 	)
// )

module.exports = { encrypt, decrypt, getKey, createIv }