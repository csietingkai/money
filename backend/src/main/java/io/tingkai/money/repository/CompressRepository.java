package io.tingkai.money.repository;

import java.util.Arrays;

import org.springframework.stereotype.Component;

import io.tingkai.money.enumeration.FileType;

@Component
public class CompressRepository extends FileRepository {

	public CompressRepository() {
		super(Arrays.asList(FileType.ZIP, FileType.RAR, FileType.ZIP7, FileType.TARGZ, FileType.GZIP));
	}
}
