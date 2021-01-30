package io.tingkai.money;

import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

import io.tingkai.money.util.TaxIdUtil;

@SpringBootTest
public class TaxIdUtilTest {

	@Test
	public void test() {
		testVerify();
	}

	private void testVerify() {
		String taxId1 = "04595257";
		String taxId2 = "10458575";
		String taxId3 = "10458572";

		// verify
		Assertions.assertTrue(TaxIdUtil.verify(taxId1));
		Assertions.assertTrue(TaxIdUtil.verify(taxId2));
		Assertions.assertFalse(TaxIdUtil.verify(taxId3));
	}
}
