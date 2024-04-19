package io.tingkai.money.repository;

public abstract class FileRepository {

	protected String type;

	public FileRepository(String acceptedType) {
		this.type = acceptedType;
	}

	public String getName() {
		return this.getClass().getSimpleName();
	}

	public String getAcceptedType() {
		return type;
	}
}
