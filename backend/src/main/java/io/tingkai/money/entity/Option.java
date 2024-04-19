package io.tingkai.money.entity;

import java.util.UUID;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.Table;
import javax.persistence.UniqueConstraint;

import io.tingkai.money.constant.DatabaseConstants;
import lombok.Data;

@Entity
@Data
@Table(name = DatabaseConstants.TABLE_OPTION, uniqueConstraints = { @UniqueConstraint(columnNames = { "catergory", "name" }) })
public class Option {
	@Id
	@GeneratedValue(strategy = GenerationType.AUTO)
	protected UUID id;
	protected String catergory;
	protected String name;
	protected String enText;
	protected String twText;

	public Option() {
	}

	public Option(String catergory, String name, String enText, String twText) {
		this.catergory = catergory;
		this.name = name;
		this.enText = enText;
		this.twText = twText;
	}
}