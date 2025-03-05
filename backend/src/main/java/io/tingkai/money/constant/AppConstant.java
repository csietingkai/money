package io.tingkai.money.constant;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class AppConstant {

	public static String GRID_FS_DATABASE;
	public static String PYTHON_BASE_URL;
	public static int FETCH_MAX_RECORD;

	@Value("${spring.data.mongodb.grid-fs-database}")
	public void setGridFsDatabase(String gridFsDatabase) {
		AppConstant.GRID_FS_DATABASE = gridFsDatabase;
	}

	@Value("${python-base-url}")
	public void setPythonUrl(String pythonBaseUrl) {
		AppConstant.PYTHON_BASE_URL = pythonBaseUrl;
	}

	@Value("${fetch-max-record}")
	public void setFetchMaxRecord(int fetchMaxRecord) {
		AppConstant.FETCH_MAX_RECORD = fetchMaxRecord;
	}
}
