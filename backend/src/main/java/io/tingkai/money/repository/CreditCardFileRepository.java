package io.tingkai.money.repository;

import org.springframework.stereotype.Component;

import io.tingkai.money.enumeration.option.FinancialFileType;

@Component
public class CreditCardFileRepository extends FileRepository {

	public CreditCardFileRepository() {
		super(FinancialFileType.CREDIT_CARD);
	}
}
