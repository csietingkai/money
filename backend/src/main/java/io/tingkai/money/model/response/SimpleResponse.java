package io.tingkai.money.model.response;

import io.tingkai.money.constant.MessageConstant;

public class SimpleResponse extends BaseResponse<Void> {

	public SimpleResponse(boolean success) {
		super(success, null, (success ? MessageConstant.SUCCESS : MessageConstant.FAIL));
	}

	public SimpleResponse(Exception e) {
		super(e);
	}
}
