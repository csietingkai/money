package io.tingkai.money.repository;

import org.springframework.stereotype.Component;

import io.tingkai.money.enumeration.option.FinancialFileType;

@Component
public class StockFileRepository extends FileRepository {

	public StockFileRepository() {
		super(FinancialFileType.STOCK);
	}
}
