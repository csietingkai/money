package io.tingkai.money.repository;

import java.util.Arrays;

import org.springframework.stereotype.Component;

import io.tingkai.money.enumeration.FileType;

@Component
public class VideoRepository extends FileRepository {

	public VideoRepository() {
		super(Arrays.asList(FileType.MP4, FileType.MKV, FileType.WMV, FileType.AVI));
	}
}
