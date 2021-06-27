package io.tingkai.money.service;

import java.time.LocalDateTime;
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
import io.tingkai.money.util.StringUtil;

@Service
public class StockService {

	@Autowired
	private StockFacade stockFacade;

	@Autowired
	private StockRecordFacade stockRecordFacade;

	public List<StockVo> getAll(String code, String name, boolean sort) throws QueryNotResultException {
		List<Stock> stocks = this.stockFacade.queryAll(sort);
		List<StockVo> vos = new ArrayList<StockVo>();
		for (Stock stock : stocks) {
			if ((!StringUtil.isBlank(code) && !stock.getCode().equals(code)) || (!StringUtil.isBlank(name) && !stock.getName().toUpperCase().contains(name.toUpperCase()))) {
				continue;
			}
			StockVo vo = new StockVo();
			vo.transform(stock);
			vo.setUpdateTime(this.getUpdateTime(stock.getCode(), stock.getOfferingDate()));
			vos.add(vo);
		}
		return vos;
	}

	public StockVo get(String code) throws QueryNotResultException {
		Stock stock = this.stockFacade.query(code);
		StockVo vo = new StockVo();
		vo.transform(stock);
		vo.setUpdateTime(this.getUpdateTime(stock.getCode(), stock.getOfferingDate()));
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

	private LocalDateTime getUpdateTime(String code, LocalDateTime defaultTime) {
		StockRecord record = null;
		try {
			record = this.stockRecordFacade.latestRecord(code);
			return record.getDealDate();
		} catch (QueryNotResultException e) {
			e.printStackTrace();
		}
		return defaultTime;
	}
}
