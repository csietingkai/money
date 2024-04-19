package io.tingkai.money.repository;

import org.springframework.stereotype.Component;

import io.tingkai.money.enumeration.option.FinancialFileType;

@Component
public class PassbookFileRepository extends FileRepository {

	public PassbookFileRepository() {
		super(FinancialFileType.PASSBOOK);
	}
}
