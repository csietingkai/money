package io.tingkai.money.model.exception;

import io.tingkai.money.constant.MessageConstant;

/**
 * when frontend send update request and data not in database, throw this
 * exception
 * 
 * @author tingkai
 */
public class NotExistException extends BaseException {

	private static final long serialVersionUID = -9158252023859129401L;

	public NotExistException() {
		super(MessageConstant.NOT_EXIST);
	}
}
