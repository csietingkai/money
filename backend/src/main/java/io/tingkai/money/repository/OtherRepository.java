package io.tingkai.money.repository;

import java.util.Arrays;

import org.springframework.stereotype.Component;

import io.tingkai.money.enumeration.FileType;

@Component
public class OtherRepository extends FileRepository {

	public OtherRepository() {
		super(Arrays.asList(FileType.OTHER));
	}
}
