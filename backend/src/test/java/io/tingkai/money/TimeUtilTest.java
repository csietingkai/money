package io.tingkai.money;

import java.time.LocalDateTime;
import java.time.Month;

import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

import io.tingkai.money.enumeration.CompareResult;
import io.tingkai.money.util.TimeUtil;

@SpringBootTest
public class TimeUtilTest {

	@Test
	public void test() {
		testVerify();
	}

	private void testVerify() {
		String dateStr = "2020/01/22";
		String timeStr = "12:26:53";
		String dateTimeStr = dateStr + " " + timeStr;
		String futureDateTimeString = "2030/01/22 12:26:53";
		long timeStamp = 1579667213000L;
		Assertions.assertTrue(timeStamp == TimeUtil.convertToTimeStamp(dateTimeStr));

		// verify
		Assertions.assertTrue(TimeUtil.verify(dateTimeStr));

		// random
		System.out.println(TimeUtil.generate());

		// convert
		Assertions.assertTrue("2020-01-22T12:26:53".equals(TimeUtil.convertToDateTime(dateTimeStr).toString()));
		Assertions.assertTrue("2020-01-22T12:26:53".equals(TimeUtil.convertToDateTime(timeStamp).toString()));
		Assertions.assertTrue(dateTimeStr.equals(TimeUtil.convertToString(LocalDateTime.of(2020, Month.JANUARY, 22, 12, 26, 53))));
		Assertions.assertTrue(dateTimeStr.equals(TimeUtil.convertToString(timeStamp).toString()));
		Assertions.assertTrue(timeStamp == TimeUtil.convertToTimeStamp(LocalDateTime.of(2020, Month.JANUARY, 22, 12, 26, 53)));

		Assertions.assertTrue(CompareResult.BIGGER_THAN == TimeUtil.compare(futureDateTimeString, dateTimeStr));
		Assertions.assertFalse(CompareResult.BIGGER_THAN == TimeUtil.compare(dateTimeStr, futureDateTimeString));
		Assertions.assertTrue(CompareResult.EQUAL == TimeUtil.compare(dateTimeStr, dateTimeStr));

		// leap year
		Assertions.assertTrue(TimeUtil.isLeap(2020));
		Assertions.assertFalse(TimeUtil.isLeap(2019));
	}
}
