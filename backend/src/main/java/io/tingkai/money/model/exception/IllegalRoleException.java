package io.tingkai.money.model.exception;

import io.tingkai.money.constant.MessageConstant;

/**
 * when frontend send register request and role doesn't exist, throw this
 * exception
 * 
 * @author tingkai
 */
public class IllegalRoleException extends BaseException {

	private static final long serialVersionUID = -4923133445731588844L;

	public IllegalRoleException(String roleStr) {
		super(MessageConstant.NO_THIS_ROLE, roleStr);
	}
}
