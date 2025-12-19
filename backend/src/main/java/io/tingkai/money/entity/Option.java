package io.tingkai.money.entity;

import java.text.MessageFormat;
import java.util.UUID;

import io.tingkai.money.constant.DatabaseConstant;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.Data;

@Entity
@Data
@Table(name = DatabaseConstant.TABLE_OPTION, uniqueConstraints = { @UniqueConstraint(columnNames = { "catergory", "name" }) })
public class Option {

	@Id
	@GeneratedValue(strategy = GenerationType.AUTO)
	protected UUID id;

	protected String catergory;

	protected String name;

	public String getI18nKey() {
		return MessageFormat.format("OPTION.{0}.{1}", catergory, name);
	}
}