package io.tingkai.money.controller;

import java.io.IOException;
import java.io.UnsupportedEncodingException;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

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

import io.tingkai.base.model.exception.AlreadyExistException;
import io.tingkai.base.model.exception.FieldMissingException;
import io.tingkai.base.model.exception.NotExistException;
import io.tingkai.base.model.response.BaseResponse;
import io.tingkai.base.model.response.SimpleResponse;
import io.tingkai.base.util.BaseAppUtil;
import io.tingkai.base.util.BaseFileUtil;
import io.tingkai.money.constant.MessageConstant;
import io.tingkai.money.entity.FinancialFile;
import io.tingkai.money.model.exception.FinancialFileNotFoundException;
import io.tingkai.money.service.FinancialFileService;

@RestController
@RequestMapping(value = FinancialFileController.CONTROLLER_PREFIX)
public class FinancialFileController {

	public static final String CONTROLLER_PREFIX = "/financialFile";
	public static final String LIST_PATH = "/list";
	public static final String UPLOAD_PATH = "/upload";
	public static final String UPDATE_PATH = "/update";
	public static final String DOWNLOAD_PATH = "/download";
	public static final String DELETE_PATH = "/remove";

	@Autowired
	private FinancialFileService fileService;

	@RequestMapping(value = FinancialFileController.LIST_PATH, method = RequestMethod.GET)
	public BaseResponse<List<FinancialFile>> list(@RequestParam(required = false) LocalDate date, @RequestParam(required = false) String type) {
		List<FinancialFile> files = null;
		if (BaseAppUtil.isAllPresent(date, type)) {
			this.fileService.getAll(date.atStartOfDay(), type);
		} else if (BaseAppUtil.isPresent(date)) {
			files = this.fileService.getAll(date.atStartOfDay());
		} else if (BaseAppUtil.isPresent(type)) {
			files = this.fileService.getAll(type);
		} else {
			files = this.fileService.getAll();
		}
		return new BaseResponse<List<FinancialFile>>(true, files, MessageConstant.SUCCESS);
	}

	@RequestMapping(value = FinancialFileController.UPLOAD_PATH, method = RequestMethod.POST)
	public SimpleResponse upload(@RequestParam MultipartFile file, @RequestParam LocalDate date, @RequestParam String type) throws AlreadyExistException, FieldMissingException, IOException {
		FinancialFile entity = this.fileService.upload(file, type, date.atStartOfDay());
		return new SimpleResponse(true, MessageConstant.FILE_UPLOAD_SUCCESS, entity.getFilename());
	}

	@RequestMapping(value = FinancialFileController.UPDATE_PATH, method = RequestMethod.POST)
	public SimpleResponse update(@RequestParam UUID id, @RequestParam LocalDate date, @RequestParam String type) throws NotExistException, FieldMissingException {
		FinancialFile entity = this.fileService.update(id, type, date.atStartOfDay());
		return new SimpleResponse(true, MessageConstant.FILE_UPLOAD_SUCCESS, entity.getFilename());
	}

	@RequestMapping(value = FinancialFileController.DOWNLOAD_PATH, method = RequestMethod.GET)
	public ResponseEntity<Resource> download(@RequestParam UUID fileId) throws UnsupportedEncodingException, FinancialFileNotFoundException {
		FinancialFile entity = this.fileService.get(fileId);
		InputStreamResource resource = this.fileService.download(fileId);
		HttpHeaders header = BaseFileUtil.getFileHeader(entity.getFilename());
		return ResponseEntity.ok().headers(header).contentType(MediaType.APPLICATION_OCTET_STREAM).body(resource);
	}

	@RequestMapping(value = FinancialFileController.DELETE_PATH, method = RequestMethod.DELETE)
	public SimpleResponse delete(@RequestParam UUID id) throws NotExistException {
		FinancialFile entity = this.fileService.delete(id);
		return new SimpleResponse(true, MessageConstant.FILE_DELETE_SUCCESS, entity.getFilename());
	}
}
