package io.tingkai.money.service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import io.tingkai.money.dao.StockRecordDao;
import io.tingkai.money.entity.StockRecord;

/**
 * provide method for upload, download, find, delete database table 'stock'
 * 
 * @author tingkai
 */
@Service
public class StockRecordService {

	@Autowired
	private StockRecordDao stockRecordDao;

	public List<StockRecord> getAll() {
		List<StockRecord> records = new ArrayList<StockRecord>();
		Iterable<StockRecord> recordIterable = this.stockRecordDao.findAll();
		recordIterable.forEach(records::add);
		return records;
	}

	public StockRecord get(UUID id) {
		Optional<StockRecord> recordOptional = this.stockRecordDao.findById(id);
		if (recordOptional.isPresent()) {
			return recordOptional.get();
		} else {
			return null;
		}
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
		Optional<StockRecord> record = this.stockRecordDao.findFirstByCodeOrderByDealDateDesc(code);
		if (record.isPresent()) {
			return record.get();
		} else {
			return null;
		}
	}
}
