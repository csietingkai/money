package io.tingkai.money.service;

import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import io.tingkai.money.entity.Stock;
import io.tingkai.money.entity.StockRecord;
import io.tingkai.money.facade.StockFacade;
import io.tingkai.money.facade.StockRecordFacade;
import io.tingkai.money.model.exception.QueryNotResultException;
import io.tingkai.money.model.vo.StockVo;
import io.tingkai.money.util.AppUtil;

@Service
public class StockService {

	@Autowired
	private StockFacade stockFacade;

	@Autowired
	private StockRecordFacade stockRecordFacade;

	public List<StockVo> getAll(boolean sort) throws QueryNotResultException {
		List<Stock> stocks = this.stockFacade.queryAll(sort);
		List<StockVo> vos = new ArrayList<StockVo>();
		for (Stock stock : stocks) {
			StockVo vo = new StockVo();
			vo.transform(stock);
			StockRecord record = null;
			try {
				record = this.stockRecordFacade.latestRecord(stock.getCode());
			} catch (QueryNotResultException e) {
				e.printStackTrace();
			}
			if (AppUtil.isPresent(record)) {
				vo.setUpdateTime(record.getDealDate());
			} else {
				vo.setUpdateTime(stock.getOfferingDate());
			}
			vos.add(vo);
		}
		return vos;
	}

	public StockVo get(String code) throws QueryNotResultException {
		Stock stock = this.stockFacade.query(code);
		StockVo vo = new StockVo();
		vo.transform(stock);
		return vo;
	}

	public List<StockRecord> getAllRecords(String code) throws QueryNotResultException {
		return this.stockRecordFacade.queryAll(code);
	}

	public List<StockRecord> getAllRecords(String code, long start, long end) throws QueryNotResultException {
		return this.stockRecordFacade.queryAll(code, start, end);
	}

	public StockRecord latestRecord(String code) throws QueryNotResultException {
		return this.stockRecordFacade.latestRecord(code);
	}
}
