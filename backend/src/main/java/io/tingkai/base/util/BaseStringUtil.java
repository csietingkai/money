package io.tingkai.base.util;

import java.security.SecureRandom;

import io.tingkai.base.constant.BaseCodeConstant;

public class BaseStringUtil {

	public static boolean isEmpty(String str) {
		return BaseAppUtil.isEmpty(str) || str.length() == 0;
	}

	public static boolean isAllEmpty(String... strs) {
		for (String str : strs) {
			if (!isEmpty(str)) {
				return false;
			}
		}
		return true;
	}

	public static boolean isBlank(String str) {
		return BaseAppUtil.isEmpty(str) || str.trim().length() == 0;
	}

	public static boolean isAllBlank(String... strs) {
		for (String str : strs) {
			if (!isBlank(str)) {
				return false;
			}
		}
		return true;
	}

	public static boolean equals(String a, String b) {
		if (a == null && b == null) {
			return true;
		}
		if (!isBlank(a)) {
			return a.equals(b);
		}
		return false;
	}

	public static String toString(Object obj) {
		return BaseAppUtil.isEmpty(obj) ? BaseCodeConstant.EMPTY_STRING : obj.toString();
	}

	public static String underlineToCamel(String str) {
		if (BaseStringUtil.isBlank(str)) {
			return BaseCodeConstant.EMPTY_STRING;
		}
		StringBuilder builder = new StringBuilder();
		for (int i = 0; i < str.length(); i++) {
			char c = str.charAt(i);
			if (c == BaseCodeConstant.UNDERLINE) {
				i++;
				builder.append(Character.toUpperCase(str.charAt(i)));
			} else {
				builder.append(Character.toLowerCase(c));
			}
			c = Character.toLowerCase(c);
		}
		return builder.toString();
	}

	public static String generateRandom(int length) {
		SecureRandom random = new SecureRandom();

		StringBuilder sb = new StringBuilder();
		for (int i = 0; i < length; i++) {
			sb.append(BaseCodeConstant.RANDOM_RANGE.charAt(random.nextInt(BaseCodeConstant.RANDOM_RANGE.length())));
		}
		return sb.toString();
	}
}
