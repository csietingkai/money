package io.tingkai.base.util;

import java.util.regex.Pattern;

import io.tingkai.base.constant.BaseCodeConstant;

public class TaxIdUtil {

	private static final String TAX_ID_PATTERN = "[0-9]{8}";
	private static final int[] CHECK_NUMBERS = { 1, 2, 1, 2, 1, 2, 4, 1 };

	/**
	 * (1) 長度：共八位，全部為數字型態。<br>
	 * (2) 計算公式<br>
	 * (2.1) 各數字分別乘以 1,2,1,2,1,2,4,1。<br>
	 * (2.2) 當第 7 位數為 7 者，可取相加之倒數第二位取 0 及 1 來計算其和。<br>
	 * (2.3) 假如其和能被 10 整除，則表示營利事業統一編號正確<br>
	 */
	public static boolean verify(String taxIdStr) {
		if (BaseStringUtil.isBlank(taxIdStr) || !Pattern.matches(TAX_ID_PATTERN, taxIdStr)) {
			return false;
		}

		char[] taxIdSegs = taxIdStr.toCharArray();
		int sum = 0;
		for (int i = 0; i < taxIdSegs.length; i++) {
			int num = BaseAppUtil.toInt(taxIdSegs[i]);
			num *= CHECK_NUMBERS[i];
			sum += num / 10 + num % 10;
		}

		boolean result = sum % 10 == 0;

		if (!result && taxIdSegs[6] == 7) {
			result = (sum + 1) % 10 == 0;
		}

		return result;
	}

	public static String generate() {
		return BaseCodeConstant.EMPTY_STRING;
	}
}
