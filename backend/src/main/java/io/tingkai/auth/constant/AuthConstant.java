package io.tingkai.auth.constant;

public class AuthConstant {
	
	public static final String AUTH_CACHE = "AUTH_CACHE";

	public static final String REQUEST_TOKEN_KEY = "X-Auth-Token";
	public static final String PRNG_NAME = "SHA1PRNG";
	public static final String DIGEST_ALGORITHM_NAME = "SHA-256";
	public static final int PRNG_PRODUCT_LENGTH = 32;
	public static final int AUTH_TOKEN_VALID_HOURS = 12;
	public static final String AUTH_TOKEN_KEY = "authToken:{0}";
	public static final String AUTH_USER_KEY = "authUser:{0}";
	
	public static final String TABLE_USER = "users";
	
	public static final String AUTHENTICATE_FAIL = "Bad Token";
	public static final String LOGIN_SUCCESS = "User: {0} Login Success";
	public static final String LOGOUT_SUCCESS = "User Logout Success";
	public static final String USER_NOT_FOUND = "Username: {0} not found";
	public static final String WRONG_PASSWORD = "Wrong password";
	public static final String CREATE_USER_WARN = "Create User: {0} warning, cause by: {1}";
	public static final String AUTH_TOKEN_EXPIRE = "Auth Token has been expired";
	public static final String NO_THIS_ROLE = "Role Error: {0}";
	public static final String USER_CHANGE_PASSWORD_SUCCESS = "User Change Password Success";
}
