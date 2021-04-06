package io.tingkai.money.repository;

import java.util.Arrays;

import org.springframework.stereotype.Component;

import io.tingkai.money.enumeration.FileType;

@Component
public class ImageRepository extends FileRepository {

	public ImageRepository() {
		super(Arrays.asList(FileType.PNG, FileType.JPEG, FileType.JPG, FileType.GIF, FileType.SVG, FileType.BMP, FileType.ICO));
	}
}
