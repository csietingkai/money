package io.tingkai.money.entity;

import java.util.Date;

import org.bson.Document;

import lombok.Data;

@Data
public class File {
	private String id;
	private String filename;
	private long size;
	private Date uploadDate;
	private Document metadata;
}
