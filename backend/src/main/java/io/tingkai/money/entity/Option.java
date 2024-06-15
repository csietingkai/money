package io.tingkai.money.entity;

import java.util.UUID;

import io.tingkai.money.constant.DatabaseConstants;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
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