package io.tingkai.money.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import io.tingkai.money.entity.Stock;
import io.tingkai.money.entity.StockRecord;
import io.tingkai.money.facade.StockFacade;
import io.tingkai.money.facade.StockRecordFacade;
import io.tingkai.money.model.exception.QueryNotResultException;

@Service
public class StockService {

	@Autowired
	private StockFacade stockFacade;

	@Autowired
	private StockRecordFacade stockRecordFacade;

	public List<Stock> getAll() throws QueryNotResultException {
		return this.stockFacade.queryAll();
	}

	public Stock get(String code) throws QueryNotResultException {
		return this.stockFacade.query(code);
	}

	public List<StockRecord> getAllRecords(String code) throws QueryNotResultException {
		return this.stockRecordFacade.queryAll(code);
	}

	public List<StockRecord> getAllRecords(String code, long start, long end) throws QueryNotResultException {
		return this.stockRecordFacade.queryAll(code, start, end);
	}
}
