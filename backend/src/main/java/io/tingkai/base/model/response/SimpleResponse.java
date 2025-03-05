package io.tingkai.base.model.response;

import io.tingkai.base.constant.BaseMessageConstant;

public class SimpleResponse extends BaseResponse<Void> {

	public SimpleResponse(boolean success) {
		super(success, null, (success ? BaseMessageConstant.SUCCESS : BaseMessageConstant.FAIL));
	}

	public SimpleResponse(Exception e) {
		super(e);
	}
}
