package io.tingkai.money;

import java.math.BigDecimal;

import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

import io.tingkai.money.util.AppUtil;

@SpringBootTest
public class AppUtilTest {

	@Test
	public void test() {
		testToType();
		testCheckNull();
	}

	private void testToType() {
		Object obj = "AAA";
		Assertions.assertEquals(AppUtil.toString(obj), "AAA");
		obj = 123;
		Assertions.assertTrue(AppUtil.toInt(obj) == 123);
		obj = 123L;
		Assertions.assertTrue(AppUtil.toLong(obj) == 123L);
		obj = 123.123;
		Assertions.assertTrue(AppUtil.toDouble(obj) == 123.123);
		obj = new BigDecimal(10);
		Assertions.assertEquals(AppUtil.toBigDecimal(obj), BigDecimal.TEN);
	}

	private void testCheckNull() {
	}
}
