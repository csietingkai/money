package io.tingkai.money.repository;

import org.springframework.stereotype.Component;

import io.tingkai.money.enumeration.option.FinancialFileType;

@Component
public class FundFileRepository extends FileRepository {

	public FundFileRepository() {
		super(FinancialFileType.FUND);
	}
}
