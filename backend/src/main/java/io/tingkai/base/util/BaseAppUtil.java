package io.tingkai.base.util;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Optional;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.function.Function;
import java.util.function.Predicate;

import io.tingkai.base.constant.BaseCodeConstant;
import lombok.extern.slf4j.Slf4j;

@Slf4j
public class BaseAppUtil {

	public static String toString(Object obj) {
		if (isPresent(obj)) {
			try {
				return obj.toString();
			} catch (Exception e) {
				log.debug(obj + ":" + e.getMessage());
			}
		}
		return BaseCodeConstant.EMPTY_STRING;
	}

	public static int toInt(Object obj) {
		return toInt(obj, 0);
	}

	public static int toInt(Object obj, int defaultVal) {
		if (isPresent(obj)) {
			try {
				return Integer.parseInt(obj.toString());
			} catch (Exception e) {
				log.debug(obj + ":" + e.getMessage());
			}
		}
		return defaultVal;
	}

	public static long toLong(Object obj) {
		return toLong(obj, 0L);
	}

	public static long toLong(Object obj, long defaultVal) {
		if (isPresent(obj)) {
			try {
				return Long.parseLong(obj.toString());
			} catch (Exception e) {
				log.debug(obj + ":" + e.getMessage());
			}
		}
		return defaultVal;
	}

	public static double toDouble(Object obj) {
		return toDouble(obj, 0.0);
	}

	public static double toDouble(Object obj, double defaultVal) {
		if (isPresent(obj)) {
			try {
				return Double.parseDouble(obj.toString());
			} catch (Exception e) {
				log.debug(obj + ":" + e.getMessage());
			}
		}
		return defaultVal;
	}

	public static BigDecimal toBigDecimal(Object obj) {
		return toBigDecimal(obj, BigDecimal.ZERO);
	}

	public static BigDecimal toBigDecimal(Object obj, BigDecimal defaultVal) {
		if (isPresent(obj)) {
			try {
				return new BigDecimal(obj.toString());
			} catch (Exception e) {
				log.debug(obj + ":" + e.getMessage());
			}
		}
		return defaultVal;
	}

	public static boolean isPresent(Object obj) {
		return Optional.ofNullable(obj).isPresent();
	}

	public static boolean isAllPresent(Object... objs) {
		for (Object obj : objs) {
			if (!isPresent(obj)) {
				return false;
			}
		}
		return true;
	}

	public static boolean isEmpty(Object obj) {
		return Optional.ofNullable(obj).isEmpty();
	}

	public static boolean isAllEmpty(Object... objs) {
		for (Object obj : objs) {
			if (!isEmpty(obj)) {
				return false;
			}
		}
		return true;
	}

	public static boolean isMultipleNumber(BigDecimal big, BigDecimal small) {
		BigDecimal result = big.divide(small, RoundingMode.CEILING);
		return result.multiply(small).compareTo(big) == 0;
	}

	public static <T> Predicate<T> distinctByKey(Function<? super T, ?> keyExtractor) {
		Set<Object> seen = ConcurrentHashMap.newKeySet();
		return t -> seen.add(keyExtractor.apply(t));
	}
}
