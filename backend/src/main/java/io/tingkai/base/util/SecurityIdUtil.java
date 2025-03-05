package io.tingkai.base.util;

import java.util.Collections;
import java.util.HashMap;
import java.util.Map;
import java.util.Random;

public class SecurityIdUtil {

	private static final Map<Character, String> COUNTY_NAME = initMap();
	private static final int CONVERT_ALPHA_TO_NUM_DIFF = 10 - 'A';
	private static final char MALE = '1';
	private static final char FEMALE = '2';

	private static Map<Character, String> initMap() {
		Map<Character, String> map = new HashMap<Character, String>();
		map.put('A', "台北市");
		map.put('B', "台中市");
		map.put('C', "基隆市");
		map.put('D', "台南市");
		map.put('E', "高雄市");
		map.put('F', "台北縣");
		map.put('G', "宜蘭縣");
		map.put('H', "桃園縣");
		map.put('I', "嘉義市");
		map.put('J', "新竹縣");
		map.put('K', "苗栗縣");
		map.put('L', "台中縣");
		map.put('M', "南投縣");
		map.put('N', "彰化縣");
		map.put('O', "新竹市");
		map.put('P', "雲林縣");
		map.put('Q', "嘉義縣");
		map.put('R', "台南縣");
		map.put('S', "高雄縣");
		map.put('T', "屏東縣");
		map.put('U', "花蓮縣");
		map.put('V', "台東縣");
		map.put('W', "金門縣");
		map.put('X', "澎湖縣");
		map.put('Y', "陽明山");
		map.put('Z', "連江縣");
		return Collections.unmodifiableMap(map);
	}

	/**
	 * (1)英文轉成的數字, 個位數乘９再加上十位數 <br>
	 * (2)各數字從右到左依次乘１、２、３、４．．．．８ <br>
	 * (3)求出(1),(2)之和 <br>
	 * (4)求出(3)除10後之餘數,用10減該餘數,結果就是檢查碼,若餘數為0，檢查碼就是0 <br>
	 */
	public boolean verify(String idnoStr) {
		// 檢查身分證字號長度是否為 10
		if (BaseAppUtil.isEmpty(idnoStr) || idnoStr.length() != 10) {
			return false;
		}

		char[] idnoSegs = idnoStr.toUpperCase().toCharArray();

		// 檢查第一碼是否為正確的縣市名稱代號
		if (!COUNTY_NAME.containsKey(idnoSegs[0])) {
			return false;
		}

		// 檢查第二碼(性別)
		if (MALE != idnoSegs[1] && FEMALE != idnoSegs[1]) {
			return false;
		}

		// 計算檢查碼
		int checkNum = idnoSegs[9] - '0';
		int computedCheckNum = computeCheckNum(idnoSegs);
		return computedCheckNum == checkNum;
	}

	public String generate() {
		char[] idnoSegs = { 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 };
		Random randomGenerator = new Random();

		// 縣市
		idnoSegs[0] = (char) (randomGenerator.nextInt(26) + 'A');

		// 性別
		idnoSegs[1] = (char) (randomGenerator.nextInt(2) + 1 + '0');

		// 隨機七碼
		for (int i = 2; i <= 8; i++) {
			idnoSegs[i] = (char) (randomGenerator.nextInt(9) + 1 + '0');
		}

		// 檢查碼
		idnoSegs[9] = (char) (computeCheckNum(idnoSegs) + '0');

		StringBuilder builder = new StringBuilder();
		for (int i = 0; i < 10; i++) {
			builder.append(idnoSegs[i]);
		}
		return builder.toString();
	}

	private int computeCheckNum(char[] segs) {
		int sum = handleFirstChar(segs[0]);
		for (int i = 1; i <= 8; i++) {
			sum += (segs[i] - '0') * (9 - i);
		}

		return (10 - (sum % 10)) % 10;
	}

	private int handleFirstChar(char firstChar) {
		int num = firstChar + CONVERT_ALPHA_TO_NUM_DIFF;

		return (num / 10) % 10 + num % 10 * 9;
	}

}
