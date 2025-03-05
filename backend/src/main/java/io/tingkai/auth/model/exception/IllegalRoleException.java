package io.tingkai.auth.model.exception;

import io.tingkai.auth.constant.AuthConstant;
import io.tingkai.base.model.exception.BaseException;

public class IllegalRoleException extends BaseException {

	private static final long serialVersionUID = 1L;

	public IllegalRoleException(String roleStr) {
		super(AuthConstant.NO_THIS_ROLE, roleStr);
	}
}
