package io.tingkai.money.constant;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

/**
 * read variables from <a href=
 * "file:../../../../../resources/application.properties">application.properties</a>
 * 
 * @author tingkai
 */
@Component
public class AppConstants {

	public static String INIT_ROOT_USERNAME;
	public static String INIT_ROOT_PASSWORD;
	public static int INIT_ROOT_PASSWORD_LENGTH;
	public static String INIT_ROOT_EMAIL;

	public static String GRID_FS_DATABASE;
	public static String ZIP_FILE_ENCODING;
	public static int FILE_IO_BUFFER_SIZE;
	public static String CONFIRM_EMAIL_LINK;
	public static boolean DEBUG_MODE;

	public static String FRONTEND_URL;

	public static String PYTHON_BASE_URL;
	public static String PYTHON_FETCH_PATH;

	@Value("${init-root-username}")
	public void setInitRootUsername(String username) {
		AppConstants.INIT_ROOT_USERNAME = username;
	}

	@Value("${init-root-password}")
	public void setInitRootPassword(String password) {
		AppConstants.INIT_ROOT_PASSWORD = password;
	}

	@Value("${init-root-password-length}")
	public void setInitRootPasswordLength(int length) {
		AppConstants.INIT_ROOT_PASSWORD_LENGTH = length;
	}

	@Value("${init-root-email}")
	public void setInitRootEmail(String email) {
		AppConstants.INIT_ROOT_EMAIL = email;
	}

	@Value("${spring.data.mongodb.grid-fs-database}")
	public void setGridFsDatabase(String gridFsDatabase) {
		AppConstants.GRID_FS_DATABASE = gridFsDatabase;
	}

	@Value("${zip-file-encoding}")
	public void setZipFileEncoding(String zipFileEncoding) {
		AppConstants.ZIP_FILE_ENCODING = zipFileEncoding;
	}

	@Value("${file-io-buffer-size}")
	public void setFileIOBufferSize(int fileIOBufferSize) {
		AppConstants.FILE_IO_BUFFER_SIZE = fileIOBufferSize;
	}

	@Value("${confirm-email-link}")
	public void setConfirmEmailLink(String confirmEmailLink) {
		AppConstants.CONFIRM_EMAIL_LINK = confirmEmailLink;
	}

	@Value("${debug-mode}")
	public void setDebugMode(boolean debugMode) {
		AppConstants.DEBUG_MODE = debugMode;
	}

	@Value("${frontend-url}")
	public void setFrontendUrl(String frontendUrl) {
		AppConstants.FRONTEND_URL = frontendUrl;
	}

	@Value("${python-base-url}")
	public void setPythonUrl(String pythonBaseUrl) {
		AppConstants.PYTHON_BASE_URL = pythonBaseUrl;
	}

	@Value("${python-fetch-path}")
	public void setFetchPath(String pythonFetchPath) {
		AppConstants.PYTHON_FETCH_PATH = pythonFetchPath;
	}
}
