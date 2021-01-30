package io.tingkai.money.model.response;

import io.tingkai.money.controller.FileController;

/**
 * response when all request in {@link FileController}.
 * 
 * @author tingkai
 */
public class FileResponse<T> extends BaseResponse<T> {

	public FileResponse(boolean success, T t, String pattern) {
		super(success, t, pattern);
	}

	public FileResponse(boolean success, T t, String pattern, String... params) {
		super(success, t, pattern, params);
	}

	public FileResponse(Exception e) {
		super(e);
	}

}
