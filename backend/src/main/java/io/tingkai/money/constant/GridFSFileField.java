package io.tingkai.money.constant;

import com.mongodb.client.gridfs.model.GridFSFile;

/**
 * Field names for {@link GridFSFile}
 * 
 * @author tingkai
 */
public class GridFSFileField {

	public static final String ID = "_id";
	public static final String FILENAME = "filename";
	public static final String MD5 = "md5";

	public static final String METADATA_PREFIX = "metadata.";
	public static final String METADATA_CONTENT_TYPE_KEY = "contentType";
	public static final String METADATA_HANDLE_KEY = "handle";
	public static final String METADATA_UPLOADER_KEY = "uploader";
	public static final String METADATA_CATEGORY_KEY = "category";
}
