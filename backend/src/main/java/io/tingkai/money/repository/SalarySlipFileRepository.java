package io.tingkai.money.repository;

import org.springframework.stereotype.Component;

import io.tingkai.money.enumeration.option.FinancialFileType;

@Component
public class SalarySlipFileRepository extends FileRepository {

	public SalarySlipFileRepository() {
		super(FinancialFileType.SALARY_SLIP);
	}
}
