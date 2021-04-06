package io.tingkai.money.model.response;

import java.util.List;
import java.util.Map;

public class EnumResponse extends BaseResponse<List<Map<String, String>>> {

	public EnumResponse(boolean success, List<Map<String, String>> enums, String pattern) {
		super(success, enums, pattern);
	}

	public EnumResponse(boolean success, List<Map<String, String>> enums, String pattern, String... params) {
		super(success, enums, pattern, params);
	}

	public EnumResponse(Exception e) {
		super(e);
	}
}
