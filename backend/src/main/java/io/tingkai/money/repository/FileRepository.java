package io.tingkai.money.repository;

import java.util.List;

import io.tingkai.money.enumeration.FileType;

/**
 * abstract class of file repository. <br>
 * every time add a new repository, create GridFS Bucket in MongoDB and use
 * constructor to set what file extension can store into this repository
 * 
 * @author tingkai
 */
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
