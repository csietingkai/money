package io.tingkai.money.model.exception;

import io.tingkai.money.constant.MessageConstant;

/**
 * when frontend send query request and database no result found, throw this
 * exception
 * 
 * @author tingkai
 */
public class QueryNotResultException extends BaseException {

	private static final long serialVersionUID = 3362453575416502873L;

	public QueryNotResultException(String target) {
		super(MessageConstant.QUERY_NO_DATA, target);
	}
}
