import crypto from 'crypto';

import sanitizedConfig from '../src/config';
import { BadRequestError } from '@sn_common/common';

var password = sanitizedConfig.CRYPT_PASSWORD;

var iv = Buffer.from(sanitizedConfig.IV);

var ivstring = iv.toString('hex').slice(0, 16);

function sha1(input: any) {
	return crypto.createHash('sha1').update(input).digest();
}

function password_derive_bytes(password: string, salt: string, iterations: number, len: number) {
	var key = Buffer.from(password + salt);
	for (var i = 0; i < iterations; i++) {
		key = sha1(key);
	}
	if (key.length < len) {
		var hx = password_derive_bytes(password, salt, iterations - 1, 20);
		for (var counter = 1; key.length < len; ++counter) {
			key = Buffer.concat([key, sha1(Buffer.concat([Buffer.from(counter.toString()), hx]))]);
		}
	}
	return Buffer.alloc(len, key);
}

async function encode(string: string) {
	var key = password_derive_bytes(password, '', 100, 32);
	var cipher = crypto.createCipheriv('aes-256-cbc', key, ivstring);
	var part1 = cipher.update(string, 'utf8');
	var part2 = cipher.final();
	const encrypted = Buffer.concat([part1, part2]).toString('base64');
	return encrypted;
}

async function decode(string: string) {
	try {
		var key = password_derive_bytes(password, '', 100, 32);
		var decipher = crypto.createDecipheriv('aes-256-cbc', key, ivstring);
		var decrypted = decipher.update(string, 'base64', 'utf8');
		decrypted += decipher.final();
		return decrypted;
	} catch (err) {
		console.log(err);
		throw new BadRequestError('invalid details in decoded');
	}
}

export { encode, decode };
