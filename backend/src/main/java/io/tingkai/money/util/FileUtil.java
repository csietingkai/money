package io.tingkai.money.util;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.function.Consumer;

import org.apache.tika.Tika;
import org.springframework.http.HttpHeaders;

import com.mongodb.client.gridfs.GridFSFindIterable;
import com.mongodb.client.gridfs.model.GridFSFile;

import io.tingkai.money.entity.File;
import io.tingkai.money.enumeration.CompareOrderType;

/**
 * Provide method to get mimetype, convert {@link GridFSFile} to {@link File}
 * 
 * @author tingkai
 */
public class FileUtil {

	public static String getMimeType(String filename) {
		Tika tika = new Tika();
		return tika.detect(filename);
	}

	public static List<File> convert(GridFSFindIterable iterable) {
		return convert(iterable, CompareOrderType.NEWEST_FIRST);
	}

	public static List<File> convert(GridFSFindIterable iterable, CompareOrderType orderType) {
		List<File> files = new ArrayList<>();
		iterable.forEach((Consumer<GridFSFile>) (GridFSFile gridfsFile) -> {
			files.add(FileUtil.convert(gridfsFile));
		});
		files.sort((Comparator<File>) (File o1, File o2) -> {
			switch (orderType) {
			case OLDEST_FIRST:
				return o1.getUploadDate().compareTo(o2.getUploadDate());
			case NEWEST_FIRST:
			default:
				return o2.getUploadDate().compareTo(o1.getUploadDate());
			}
		});
		return files;
	}

	public static File convert(GridFSFile gridfsFile) {
		File file = null;
		if (AppUtil.isPresent(gridfsFile)) {
			file = new File();
			file.setId(gridfsFile.getObjectId().toString());
			file.setFilename(gridfsFile.getFilename());
			file.setSize(gridfsFile.getLength());
			file.setUploadDate(gridfsFile.getUploadDate());
//			file.setMd5(gridfsFile.getMetadata());
			file.setMetadata(gridfsFile.getMetadata());
		}
		return file;
	}

	public static HttpHeaders getFileHeader(String filename) {
		HttpHeaders header = new HttpHeaders();
		// TODO text constant
		header.add(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + filename);
		header.add(HttpHeaders.CACHE_CONTROL, "no-cache, no-store, must-revalidate");
		header.add(HttpHeaders.PRAGMA, "no-cache");
		header.add(HttpHeaders.EXPIRES, "0");
		return header;
	}
}
