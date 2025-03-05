package io.tingkai.auth.security;

import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;

import org.springframework.security.crypto.codec.Hex;
import org.springframework.stereotype.Service;

import io.tingkai.auth.constant.AuthConstant;

@Service
public class TokenStringService {

	private SecureRandom secureRandom;
	private MessageDigest messageDigest;

	public TokenStringService() throws NoSuchAlgorithmException {
		secureRandom = SecureRandom.getInstance(AuthConstant.PRNG_NAME);
		messageDigest = MessageDigest.getInstance(AuthConstant.DIGEST_ALGORITHM_NAME);
		secureRandom.nextBytes(new byte[32]);
	}

	public String next() {
		byte[] randomBytes = new byte[AuthConstant.PRNG_PRODUCT_LENGTH];
		secureRandom.nextBytes(randomBytes);
		byte[] digestBytes = messageDigest.digest(randomBytes);
		return new String(Hex.encode(digestBytes));
	}
}
