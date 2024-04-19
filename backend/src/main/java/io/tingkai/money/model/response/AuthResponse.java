package io.tingkai.money.model.response;

import io.tingkai.money.model.vo.LoginRespVo;

public class AuthResponse extends BaseResponse<LoginRespVo> {

	public AuthResponse(boolean success, LoginRespVo vo, String pattern) {
		super(success, vo, pattern);
	}

	public AuthResponse(boolean success, LoginRespVo vo, String pattern, String... params) {
		super(success, vo, pattern, params);
	}

	public AuthResponse(Exception e) {
		super(e);
	}
}
