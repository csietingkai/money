package io.tingkai.money.service;

import java.util.List;

import org.springframework.stereotype.Service;

import io.tingkai.money.enumeration.FileType;
import io.tingkai.money.repository.FileRepository;

@Service
public class RepositoryService {

	private List<FileRepository> fileRepositories;

	public RepositoryService(List<FileRepository> fileRepositories) {
		super();
		this.fileRepositories = fileRepositories;
	}

	public FileRepository getFileRepository(String filename) {
		FileType fileType = FileType.getTypeByFilename(filename);
		return this.getFileRepository(fileType);
	}

	public FileRepository getFileRepository(FileType fileType) {
		return this.fileRepositories.stream().filter((repository) -> {
			return repository.getAcceptedTypes().contains(fileType);
		}).findFirst().get();
	}

	public List<FileRepository> getFileRepositories() {
		return this.fileRepositories;
	}
}
