package io.tingkai.money.service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import io.tingkai.money.constant.DatabaseConstants;
import io.tingkai.money.dao.StockRecordDao;
import io.tingkai.money.entity.StockRecord;
import io.tingkai.money.model.exception.QueryNotResultException;
import io.tingkai.money.util.TimeUtil;

@Service
public class StockRecordService {

	@Autowired
	private StockRecordDao stockRecordDao;

	public List<StockRecord> getAll(String code) throws QueryNotResultException {
		List<StockRecord> entities = new ArrayList<StockRecord>();
		Iterable<StockRecord> iterable = this.stockRecordDao.findByCodeOrderByDealDate(code);
		iterable.forEach(entities::add);
		if (entities.size() == 0) {
			throw new QueryNotResultException(DatabaseConstants.TABLE_STOCK_RECORD);
		}
		return entities;
	}

	public List<StockRecord> get(String code, long start, long end) throws QueryNotResultException {
		List<StockRecord> entities = new ArrayList<StockRecord>();
		Iterable<StockRecord> iterable = this.stockRecordDao.findByCodeAndDealDateAfterAndDealDateBeforeOrderByDealDate(code, TimeUtil.convertToDateTime(start), TimeUtil.convertToDateTime(end));
		iterable.forEach(entities::add);
		if (entities.size() == 0) {
			throw new QueryNotResultException(DatabaseConstants.TABLE_STOCK_RECORD);
		}
		return entities;
	}

	public StockRecord get(UUID id) throws QueryNotResultException {
		Optional<StockRecord> optional = this.stockRecordDao.findById(id);
		if (optional.isEmpty()) {
			throw new QueryNotResultException(DatabaseConstants.TABLE_STOCK_RECORD);
		}
		return optional.get();
	}

	public boolean save(StockRecord entity) {
		this.stockRecordDao.save(entity);
		return true;
	}

	public boolean saveAll(List<StockRecord> entities) {
		this.stockRecordDao.saveAll(entities);
		return true;
	}

	public boolean delete(UUID id) {
		this.stockRecordDao.deleteById(id);
		return true;
	}

	public boolean delete(StockRecord entity) {
		this.stockRecordDao.delete(entity);
		return true;
	}

	public long count() {
		return this.stockRecordDao.count();
	}

	public StockRecord lastestRecord(String code) {
		Optional<StockRecord> optional = this.stockRecordDao.findFirstByCodeOrderByDealDateDesc(code);
		if (optional.isPresent()) {
			return optional.get();
		} else {
			return null;
		}
	}
}
