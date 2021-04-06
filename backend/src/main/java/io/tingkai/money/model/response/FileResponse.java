package io.tingkai.money.model.response;

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
