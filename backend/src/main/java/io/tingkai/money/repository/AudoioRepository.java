package io.tingkai.money.repository;

import java.util.Arrays;

import org.springframework.stereotype.Component;

import io.tingkai.money.enumeration.FileType;

/**
 * repository store sound file, eg: mp3, flac, m4a, aac, wav, ogg
 * 
 * @author tingkai
 */
@Component
public class AudoioRepository extends FileRepository {

	public AudoioRepository() {
		super(Arrays.asList(FileType.MP3, FileType.FLAC, FileType.M4A, FileType.AAC, FileType.WAV, FileType.OGG));
	}
}
