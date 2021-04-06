package io.tingkai.money.repository;

import java.util.List;

import io.tingkai.money.enumeration.FileType;

public abstract class FileRepository {

	protected List<FileType> types;

	public FileRepository(List<FileType> acceptedTypes) {
		this.types = acceptedTypes;
	}

	public String getName() {
		return this.getClass().getSimpleName();
	}

	public List<FileType> getAcceptedTypes() {
		return types;
	}
}
