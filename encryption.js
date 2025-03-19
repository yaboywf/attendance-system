const crypto = require('crypto');

function createIv() {
	return crypto.randomBytes(16);
}

function encrypt(text) {
	const cipher = crypto.createCipheriv('aes-256-cbc', secretKey, iv);
	let encrypted = cipher.update(text, 'utf8', 'hex');
	encrypted += cipher.final('hex');
	return { iv: iv.toString('hex'), encryptedData: encrypted };
}

function decrypt(encryptedData, iv) {
	const decipher = crypto.createDecipheriv('aes-256-cbc', secretKey, Buffer.from(iv, 'hex'));
	let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
	decrypted += decipher.final('utf8');
	return decrypted;
}

function getSecretKeyFromPassword(password) {
	let bufferPassword = Buffer.from(password);

	if (bufferPassword.length < 32) {
		const paddingLength = 32 - bufferPassword.length;
		bufferPassword = Buffer.concat([bufferPassword, Buffer.alloc(paddingLength, ' ')]);
	}

	if (bufferPassword.length > 32) {
		bufferPassword = bufferPassword.slice(0, 32);
	}

	return bufferPassword;
}