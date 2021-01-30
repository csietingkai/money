package io.tingkai.money.service;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.URLConnection;

import org.bson.Document;
import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.InputStreamResource;
import org.springframework.lang.Nullable;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.mongodb.client.MongoClient;
import com.mongodb.client.MongoDatabase;
import com.mongodb.client.gridfs.GridFSBucket;
import com.mongodb.client.gridfs.GridFSBuckets;
import com.mongodb.client.gridfs.GridFSFindIterable;
import com.mongodb.client.gridfs.model.GridFSUploadOptions;
import com.mongodb.client.model.Filters;

import io.tingkai.money.constant.AppConstants;
import io.tingkai.money.constant.GridFSFileField;
import io.tingkai.money.repository.FileRepository;
import io.tingkai.money.util.AppUtil;
import io.tingkai.money.util.ContextUtil;

/**
 * provide method for upload, download, find, delete files stored in
 * {@link FileRepository}
 * 
 * @author tingkai
 */
@Service
public class FileService {

	@Autowired
	private MongoClient mongoClient;

	@Autowired
	private RepositoryService repositoryService;

	public void upload(MultipartFile file, @Nullable String category) throws IOException {
		FileRepository fileRepository = this.repositoryService.getFileRepository(file.getOriginalFilename());
		OutputStream updaloadStream = this.getUploadStream(fileRepository.getName(), file.getOriginalFilename(), category);
		updaloadStream.write(file.getBytes());
		updaloadStream.close();
	}

	public InputStreamResource download(String filename) {
		FileRepository fileRepository = this.repositoryService.getFileRepository(filename);
		InputStream downloadStream = this.getDownloadStream(fileRepository.getName(), filename);
		InputStreamResource resource = new InputStreamResource(downloadStream);
		return resource;
	}

	public void delete(String repositoryName, String id) {
		this.getBucket(repositoryName).delete(new ObjectId(id));
	}

	public GridFSFindIterable find(String repositoryName) {
		return this.getBucket(repositoryName).find();
	}

	public GridFSFindIterable find(String repositoryName, String attributeName, String value) {
		return this.getBucket(repositoryName).find(Filters.eq(attributeName, value));
	}

	public GridFSFindIterable findById(String repositoryName, String id) {
		return this.getBucket(repositoryName).find(Filters.eq(GridFSFileField.ID, new ObjectId(id)));
	}

	public GridFSFindIterable findByMetadata(String repositoryName, String attributeName, String value) {
		return this.find(repositoryName, GridFSFileField.METADATA_PREFIX + attributeName, value);
	}

	protected OutputStream getUploadStream(String repositoryName, String sourceFileName) {
		return getUploadStream(repositoryName, sourceFileName, null);
	}

	protected OutputStream getUploadStream(String repositoryName, String sourceFileName, String category) {
		Document metadata = new Document();
		metadata.append(GridFSFileField.METADATA_UPLOADER_KEY, ContextUtil.getUserName());
		metadata.append(GridFSFileField.METADATA_CONTENT_TYPE_KEY, URLConnection.guessContentTypeFromName(sourceFileName));
		if (AppUtil.isPresent(category)) {
			metadata.append(GridFSFileField.METADATA_CATEGORY_KEY, category);
		}
		GridFSUploadOptions options = new GridFSUploadOptions();
		options.metadata(metadata);
		return this.getBucket(repositoryName).openUploadStream(sourceFileName, options);
	}

	protected InputStream getDownloadStream(String repositoryName, String sourceFileName) {
		return this.getBucket(repositoryName).openDownloadStream(sourceFileName);
	}

	protected GridFSBucket getBucket(String repositoryName) {
		MongoDatabase database = this.mongoClient.getDatabase(AppConstants.GRID_FS_DATABASE);
		return GridFSBuckets.create(database, repositoryName);
	}
}
