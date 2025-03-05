package io.tingkai.base.util;

import java.io.UnsupportedEncodingException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

import org.apache.tika.Tika;
import org.springframework.http.HttpHeaders;

public class BaseFileUtil {

	public static String getMimeType(String filename) {
		Tika tika = new Tika();
		return tika.detect(filename);
	}

	public static HttpHeaders getFileHeader(String filename) throws UnsupportedEncodingException {
		HttpHeaders header = new HttpHeaders();
		header.add(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + URLEncoder.encode(filename, StandardCharsets.UTF_8.toString()));
		header.add(HttpHeaders.ACCESS_CONTROL_EXPOSE_HEADERS, "Content-Disposition");
		header.add(HttpHeaders.CACHE_CONTROL, "no-cache, no-store, must-revalidate");
		header.add(HttpHeaders.PRAGMA, "no-cache");
		header.add(HttpHeaders.EXPIRES, "0");
		return header;
	}
}
