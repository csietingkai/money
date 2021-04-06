package io.tingkai.money.controller;

import java.io.IOException;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.InputStreamResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.mongodb.client.gridfs.GridFSFindIterable;

import io.tingkai.money.constant.GridFSFileField;
import io.tingkai.money.constant.MessageConstant;
import io.tingkai.money.entity.File;
import io.tingkai.money.model.response.FileResponse;
import io.tingkai.money.model.response.SimpleResponse;
import io.tingkai.money.service.FileService;
import io.tingkai.money.service.RepositoryService;
import io.tingkai.money.util.FileUtil;

@RestController
@RequestMapping(value = FileController.CONTROLLER_PREFIX)
public class FileController {

	public static final String CONTROLLER_PREFIX = "/file";
	public static final String UPLOAD_PATH = "/upload";
	public static final String DOWNLOAD_PATH = "/download";
	public static final String DELETE_PATH = "/delete";
	public static final String FIND_ONE_PATH = "/findOne";
	public static final String LIST_PATH = "/list";
	public static final String HISTORY_PATH = "/history";
	public static final String REPOSITORY_LIST_PATH = "/repositories";

	@Autowired
	private FileService fileService;

	@Autowired
	private RepositoryService repositoryService;

	@RequestMapping(value = FileController.UPLOAD_PATH, method = RequestMethod.POST)
	public FileResponse<Void> upload(@RequestParam MultipartFile file, @RequestParam(required = false) String category) throws IOException {
		this.fileService.upload(file, category);
		return new FileResponse<Void>(true, null, MessageConstant.FILE_UPLOAD_SUCCESS, file.getOriginalFilename());
	}

	@RequestMapping(value = FileController.DOWNLOAD_PATH, method = RequestMethod.GET)
	public ResponseEntity<Resource> download(@RequestParam String filename) {
		InputStreamResource resource = this.fileService.download(filename);
		HttpHeaders header = FileUtil.getFileHeader(filename);
		return ResponseEntity.ok().headers(header).contentType(MediaType.APPLICATION_OCTET_STREAM).body(resource);
	}

	@RequestMapping(value = FileController.DELETE_PATH, method = RequestMethod.DELETE)
	public SimpleResponse delete(@RequestParam String filename, @RequestParam String id) {
		String repositoryName = this.repositoryService.getFileRepository(filename).getName();
		this.fileService.delete(repositoryName, id);
		return new SimpleResponse(true);
	}

	@RequestMapping(value = FileController.FIND_ONE_PATH, method = RequestMethod.GET)
	public FileResponse<File> findOne(@RequestParam String repositoryName, @RequestParam String id) {
		GridFSFindIterable iterable = this.fileService.findById(repositoryName, id);
		File file = FileUtil.convert(iterable.first());
		return new FileResponse<File>(true, file, MessageConstant.SUCCESS);
	}

	@RequestMapping(value = FileController.LIST_PATH, method = RequestMethod.GET)
	public FileResponse<List<File>> list(@RequestParam String repositoryName) {
		GridFSFindIterable iterable = this.fileService.find(repositoryName);
		List<File> files = FileUtil.convert(iterable);
		return new FileResponse<List<File>>(true, files, MessageConstant.SUCCESS);
	}

	@RequestMapping(value = FileController.HISTORY_PATH, method = RequestMethod.GET)
	public FileResponse<List<File>> history(@RequestParam String repositoryName, @RequestParam String filename) {
		GridFSFindIterable iterable = this.fileService.find(repositoryName, GridFSFileField.FILENAME, filename);
		List<File> files = FileUtil.convert(iterable);
		return new FileResponse<List<File>>(true, files, MessageConstant.SUCCESS);
	}

	@RequestMapping(value = FileController.REPOSITORY_LIST_PATH, method = RequestMethod.GET)
	public FileResponse<List<String>> repositories() {
		List<String> repositoryNames = this.repositoryService.getFileRepositories().stream().map((repository) -> {
			return repository.getName();
		}).collect(Collectors.toList());
		return new FileResponse<List<String>>(true, repositoryNames, MessageConstant.SUCCESS);
	}
}
