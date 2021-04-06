package io.tingkai.money.enumeration;

import io.tingkai.money.util.AppUtil;

public enum FileType {

	// @formatter:off
	PNG("png"), JPEG("jpeg"), JPG("jpg"), GIF("gif"), SVG("svg"), BMP("bmp"), ICO("ico"), 
	MP4("mp4"), MKV("mkv"), WMV("wmv"), AVI("AVI"), 
	MP3("mp3"), FLAC("flac"), M4A("m4a"), AAC("aac"), WAV("wav"), OGG("ogg"), 
	DOC("doc"), DOCX("docx"), XLS("xls"), XLSX("xlsx"), PPT("ppt"), PPTX("pptx"), PDF("pdf"), CSV("csv"), TXT("txt"), 
	ZIP("zip"), RAR("rar"), ZIP7("7z"), TARGZ("tar.gz"), GZIP("gzip"), 
	OTHER("");
	// @formatter:on
	String value;
	String endString;

	private FileType(String value) {
		this.value = value;
		if (AppUtil.isPresent(value)) {
			this.endString = "." + value;
		}
	}

	public String getValue() {
		return value;
	}

	public String getEndWith() {
		return endString;
	}

	public static FileType convertByString(String value) {
		if (AppUtil.isPresent(value)) {
			for (FileType type : FileType.values()) {
				if (value.equals(type.getValue())) {
					return type;
				}
			}
		}
		return FileType.OTHER;
	}

	public static FileType getTypeByFilename(String filename) {
		if (AppUtil.isPresent(filename)) {
			for (FileType type : FileType.values()) {
				if (filename.endsWith(type.getEndWith())) {
					return type;
				}
			}
		}
		return FileType.OTHER;
	}
}
