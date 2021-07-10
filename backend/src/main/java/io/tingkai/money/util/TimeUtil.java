package io.tingkai.money.util;

import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.TemporalUnit;

import io.tingkai.money.constant.CodeConstants;
import io.tingkai.money.enumeration.CompareResult;

public class TimeUtil {

	public static final long SECOND_MILISECS = 1000;
	public static final long MINUTE_MILISECS = 60 * SECOND_MILISECS;
	public static final long HOUR_MILISECS = 60 * MINUTE_MILISECS;
	public static final long DAY_MILISECS = 24 * HOUR_MILISECS;
	public static final long WEEK_MILISECS = 7 * DAY_MILISECS;

	public enum Unit {
		SECOND, MINUTE, HOUR, DAY, WEEK, MONTH, YEAR
	}

	private static final DateTimeFormatter DATE_TIME_FORMATTER = DateTimeFormatter.ofPattern(CodeConstants.DATE_TIME_FORMAT).withZone(CodeConstants.ZONE_TPE);

	public static long getCurrentDate() {
		return LocalDate.now().atStartOfDay(CodeConstants.ZONE_TPE).toInstant().toEpochMilli();
	}

	public static long getCurrentDateTime() {
		return LocalDateTime.now().atZone(CodeConstants.ZONE_TPE).toInstant().toEpochMilli();
	}

	public static boolean verify(String str) {
		try {
			convertToTimeStamp(str);
		} catch (Exception e) {
			e.printStackTrace();
			return false;
		}
		return true;
	}

	public static LocalDateTime generate() {
		return generate(CodeConstants.DATE_TIME_MIN, CodeConstants.DATE_TIME_MAX);
	}

	public static LocalDateTime generate(LocalDateTime start, LocalDateTime end) {
		if (start.isAfter(end)) {
			LocalDateTime temp = end;
			end = start;
			start = temp;
		}
		long startTimeStamp = convertToTimeStamp(start);
		long endTimeStamp = convertToTimeStamp(end);
		long randomTimeStamp = (long) (Math.random() * ((startTimeStamp - endTimeStamp) + 1) + startTimeStamp);
		return convertToDateTime(randomTimeStamp);
	}

	public static LocalDateTime convertToDateTime(String str) {
		return LocalDateTime.parse(str, DATE_TIME_FORMATTER);
	}

	public static LocalDateTime convertToDateTime(long timeStamp) {
		return LocalDateTime.ofInstant(Instant.ofEpochMilli(timeStamp), CodeConstants.ZONE_TPE);
	}

	public static String convertToString(LocalDateTime dateTime) {
		return DATE_TIME_FORMATTER.format(dateTime);
	}

	public static String convertToString(long timeStamp) {
		return DATE_TIME_FORMATTER.format(Instant.ofEpochMilli(timeStamp));
	}

	public static long convertToTimeStamp(LocalDateTime dateTime) {
		return dateTime.atZone(CodeConstants.ZONE_TPE).toInstant().toEpochMilli();
	}

	public static long convertToTimeStamp(String str) {
		return Instant.from(DATE_TIME_FORMATTER.parse(str)).toEpochMilli();
	}

	/**
	 * compare a is (bigger than / equal to / less than ) b
	 */
	public static CompareResult compare(LocalDateTime a, LocalDateTime b) {
		if (a.isAfter(b)) {
			return CompareResult.BIGGER_THAN;
		} else if (a.isBefore(b)) {
			return CompareResult.LESS_THAN;
		} else {
			return CompareResult.EQUAL;
		}
	}

	public static CompareResult compare(String dateStrA, String dateStrB) {
		return compare(convertToDateTime(dateStrA), convertToDateTime(dateStrB));
	}

	/**
	 * return a minus b, <br/>
	 * if result < 0 -> a is before b <br/>
	 * else if result > 0 -> a is after b <br/>
	 * else -> a is same as b <br/>
	 */
	public static long diff(LocalDateTime a, LocalDateTime b) {
		return (convertToTimeStamp(a) - convertToTimeStamp(b));
	}

	public static boolean isLeap(int year) {
		return year % 400 == 0 ? true : (year % 100 == 0 ? false : (year % 4 == 0 ? true : false));
	}

	public static long plus(long currentDateTime, int amount, TemporalUnit unit) {
		return convertToTimeStamp(convertToDateTime(currentDateTime).plus(amount, unit));
	}

	public static long minus(long currentDateTime, int amount, TemporalUnit unit) {
		return convertToTimeStamp(convertToDateTime(currentDateTime).minus(amount, unit));
	}

	public static LocalDateTime plus(LocalDateTime currentDateTime, int amount, TemporalUnit unit) {
		return currentDateTime.plus(amount, unit);
	}

	public static LocalDateTime minus(LocalDateTime currentDateTime, int amount, TemporalUnit unit) {
		return currentDateTime.minus(amount, unit);
	}
}
