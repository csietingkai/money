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
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.mongodb.client.MongoClient;
import com.mongodb.client.MongoCursor;
import com.mongodb.client.MongoDatabase;
import com.mongodb.client.gridfs.GridFSBucket;
import com.mongodb.client.gridfs.GridFSBuckets;
import com.mongodb.client.gridfs.model.GridFSFile;
import com.mongodb.client.gridfs.model.GridFSUploadOptions;

import io.tingkai.auth.util.ContextUtil;
import io.tingkai.base.log.Loggable;
import io.tingkai.base.model.exception.AlreadyExistException;
import io.tingkai.base.model.exception.FieldMissingException;
import io.tingkai.base.model.exception.NotExistException;
import io.tingkai.base.util.BaseAppUtil;
import io.tingkai.money.constant.AppConstant;
import io.tingkai.money.constant.GridFSFileField;
import io.tingkai.money.entity.FinancialFile;
import io.tingkai.money.facade.FinacialFileFacade;
import io.tingkai.money.model.exception.FinancialFileNotFoundException;
import io.tingkai.money.repository.FileRepository;

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

	public List<FinancialFile> getAll() {
		UUID userId = ContextUtil.getUserId();
		return this.finacialFileFacade.queryAll(userId);
	}

	public List<FinancialFile> getAll(LocalDateTime date) {
		UUID userId = ContextUtil.getUserId();
		return this.finacialFileFacade.queryAll(userId, date);
	}

	public List<FinancialFile> getAll(String type) {
		UUID userId = ContextUtil.getUserId();
		return this.finacialFileFacade.queryAll(userId, type);
	}

	public List<FinancialFile> getAll(LocalDateTime date, String type) {
		UUID userId = ContextUtil.getUserId();
		return this.finacialFileFacade.queryAll(userId, date, type);
	}

	public FinancialFile get(UUID fileId) {
		return this.finacialFileFacade.query(fileId);
	}

	@Transactional
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

	@Transactional
	public FinancialFile update(UUID id, String type, LocalDateTime date) throws NotExistException, FieldMissingException {
		FinancialFile entity = this.finacialFileFacade.query(id);
		entity.setType(type);
		entity.setDate(date);
		return this.finacialFileFacade.update(entity);
	}

	public InputStreamResource download(UUID fileId) throws FinancialFileNotFoundException {
		FinancialFile entity = this.get(fileId);
		InputStream downloadStream = this.getDownloadStream(entity);
		InputStreamResource resource = new InputStreamResource(downloadStream);
		return resource;
	}

	@Transactional
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
		if (BaseAppUtil.isPresent(fileObjectId)) {
			this.getBucket(this.getFileRepository(entity.getType()).getName()).delete(fileObjectId);
		}
		return entity;
	}

	protected OutputStream getUploadStream(FinancialFile entity) {
		Document metadata = new Document();
		metadata.append(GridFSFileField.METADATA_FILE_ID_KEY, entity.getId().toString());
		GridFSUploadOptions options = new GridFSUploadOptions();
		options.metadata(metadata);
		return this.getBucket(this.getFileRepository(entity.getType()).getName()).openUploadStream(entity.getFilename(), options);
	}

	protected InputStream getDownloadStream(FinancialFile entity) throws FinancialFileNotFoundException {
		GridFSBucket bucket = this.getBucket(this.getFileRepository(entity.getType()).getName());
		Document metadata = new Document(GridFSFileField.METADATA_PREFIX + GridFSFileField.METADATA_FILE_ID_KEY, entity.getId().toString());
		MongoCursor<GridFSFile> gridfsFileCursor = bucket.find(metadata).iterator();
		ObjectId fileObjectId = null;
		while (gridfsFileCursor.hasNext()) {
			fileObjectId = gridfsFileCursor.next().getObjectId();
		}
		if (BaseAppUtil.isEmpty(fileObjectId)) {
			throw new FinancialFileNotFoundException(entity.getFilename());
		}
		return bucket.openDownloadStream(fileObjectId);
	}

	protected GridFSBucket getBucket(String repositoryName) {
		MongoDatabase database = this.mongoClient.getDatabase(AppConstant.GRID_FS_DATABASE);
		return GridFSBuckets.create(database, repositoryName);
	}

	protected FileRepository getFileRepository(String financialFileType) {
		return this.fileRepositories.stream().filter((repository) -> {
			return repository.getAcceptedType().equals(financialFileType);
		}).findFirst().get();
	}
}
