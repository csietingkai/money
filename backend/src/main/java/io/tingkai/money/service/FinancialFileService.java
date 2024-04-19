package io.tingkai.money.service;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import org.bson.Document;
import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.InputStreamResource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.mongodb.client.MongoClient;
import com.mongodb.client.MongoCursor;
import com.mongodb.client.MongoDatabase;
import com.mongodb.client.gridfs.GridFSBucket;
import com.mongodb.client.gridfs.GridFSBuckets;
import com.mongodb.client.gridfs.model.GridFSFile;
import com.mongodb.client.gridfs.model.GridFSUploadOptions;

import io.tingkai.money.constant.AppConstants;
import io.tingkai.money.constant.GridFSFileField;
import io.tingkai.money.entity.FinancialFile;
import io.tingkai.money.facade.FinacialFileFacade;
import io.tingkai.money.logging.Loggable;
import io.tingkai.money.model.exception.AlreadyExistException;
import io.tingkai.money.model.exception.FieldMissingException;
import io.tingkai.money.model.exception.NotExistException;
import io.tingkai.money.repository.FileRepository;
import io.tingkai.money.util.ContextUtil;

@Service
@Loggable
public class FinancialFileService {

	private List<FileRepository> fileRepositories;

	@Autowired
	private FinacialFileFacade finacialFileFacade;

	@Autowired
	private MongoClient mongoClient;

	public FinancialFileService(List<FileRepository> fileRepositories) {
		super();
		this.fileRepositories = fileRepositories;
	}

	public List<FinancialFile> getAll(UUID userId) {
		return this.finacialFileFacade.queryAll(userId);
	}

	public List<FinancialFile> getAll(UUID userId, LocalDateTime date) {
		return this.finacialFileFacade.queryAll(userId, date);
	}

	public List<FinancialFile> getAll(UUID userId, String type) {
		return this.finacialFileFacade.queryAll(userId, type);
	}

	public List<FinancialFile> getAll(UUID userId, LocalDateTime date, String type) {
		return this.finacialFileFacade.queryAll(userId, date, type);
	}

	public FinancialFile get(UUID fileId) {
		return this.finacialFileFacade.query(fileId);
	}

	public FinancialFile upload(MultipartFile file, String type, LocalDateTime date) throws IOException, AlreadyExistException, FieldMissingException {
		FinancialFile entity = new FinancialFile();
		entity.setFilename(file.getOriginalFilename());
		entity.setUserId(ContextUtil.getUserId());
		entity.setType(type);
		entity.setDate(date);
		entity = this.finacialFileFacade.insert(entity);
		OutputStream updaloadStream = this.getUploadStream(entity);
		updaloadStream.write(file.getBytes());
		updaloadStream.close();
		return entity;
	}

	public FinancialFile update(UUID id, String type, LocalDateTime date) throws NotExistException, FieldMissingException {
		FinancialFile entity = this.finacialFileFacade.query(id);
		entity.setType(type);
		entity.setDate(date);
		return this.finacialFileFacade.update(entity);
	}

	public InputStreamResource download(UUID fileId) {
		FinancialFile entity = this.get(fileId);
		InputStream downloadStream = this.getDownloadStream(entity);
		InputStreamResource resource = new InputStreamResource(downloadStream);
		return resource;
	}

	public FinancialFile delete(UUID id) throws NotExistException {
		FinancialFile entity = this.get(id);
		this.finacialFileFacade.delete(id);
		GridFSBucket bucket = this.getBucket(this.getFileRepository(entity.getType()).getName());
		Document metadata = new Document(GridFSFileField.METADATA_PREFIX + GridFSFileField.METADATA_FILE_ID_KEY, entity.getId().toString());
		MongoCursor<GridFSFile> gridfsFileCursor = bucket.find(metadata).iterator();
		ObjectId fileObjectId = null;
		while (gridfsFileCursor.hasNext()) {
			fileObjectId = gridfsFileCursor.next().getObjectId();
		}
		this.getBucket(this.getFileRepository(entity.getType()).getName()).delete(fileObjectId);
		return entity;
	}

	protected OutputStream getUploadStream(FinancialFile entity) {
		Document metadata = new Document();
		metadata.append(GridFSFileField.METADATA_FILE_ID_KEY, entity.getId().toString());
		GridFSUploadOptions options = new GridFSUploadOptions();
		options.metadata(metadata);
		return this.getBucket(this.getFileRepository(entity.getType()).getName()).openUploadStream(entity.getFilename(), options);
	}

	protected InputStream getDownloadStream(FinancialFile entity) {
		GridFSBucket bucket = this.getBucket(this.getFileRepository(entity.getType()).getName());
		Document metadata = new Document(GridFSFileField.METADATA_PREFIX + GridFSFileField.METADATA_FILE_ID_KEY, entity.getId().toString());
		MongoCursor<GridFSFile> gridfsFileCursor = bucket.find(metadata).iterator();
		ObjectId fileObjectId = null;
		while (gridfsFileCursor.hasNext()) {
			fileObjectId = gridfsFileCursor.next().getObjectId();
		}
		return bucket.openDownloadStream(fileObjectId);
	}

	protected GridFSBucket getBucket(String repositoryName) {
		MongoDatabase database = this.mongoClient.getDatabase(AppConstants.GRID_FS_DATABASE);
		return GridFSBuckets.create(database, repositoryName);
	}

	protected FileRepository getFileRepository(String financialFileType) {
		return this.fileRepositories.stream().filter((repository) -> {
			return repository.getAcceptedType().equals(financialFileType);
		}).findFirst().get();
	}
}
