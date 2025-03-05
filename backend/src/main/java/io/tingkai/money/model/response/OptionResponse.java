package io.tingkai.money.model.response;

import java.util.List;

import io.tingkai.base.model.response.BaseResponse;
import io.tingkai.money.model.vo.OptionVo;

public class OptionResponse extends BaseResponse<List<OptionVo>> {

	public OptionResponse(boolean success, List<OptionVo> options, String pattern) {
		super(success, options, pattern);
	}

	public OptionResponse(boolean success, List<OptionVo> options, String pattern, String... params) {
		super(success, options, pattern, params);
	}

	public OptionResponse(Exception e) {
		super(e);
	}
}
