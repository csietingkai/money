package io.tingkai.base.model.response;

import io.tingkai.base.constant.BaseMessageConstant;

public class SimpleResponse extends BaseResponse<Void> {

	public SimpleResponse(boolean success) {
		this(success, (success ? BaseMessageConstant.SUCCESS : BaseMessageConstant.FAIL));
	}

	public SimpleResponse(boolean success, String pattern, String... params) {
		super(success, null, pattern, params);
	}

	public SimpleResponse(Exception e) {
		super(e);
	}
}
