package io.tingkai.money.service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import io.tingkai.money.dao.ExchangeRateRecordDao;
import io.tingkai.money.entity.ExchangeRateRecord;

/**
 * provide method for get single or multiple data from database table
 * 'exchange_rate_record'
 * 
 * @author tingkai
 */
@Service
public class ExchangeRateRecordService {

	@Autowired
	private ExchangeRateRecordDao exchangeRateRecordDao;

	public List<ExchangeRateRecord> getAll() {
		List<ExchangeRateRecord> exchangeRateRecords = new ArrayList<ExchangeRateRecord>();
		Iterable<ExchangeRateRecord> exchangeRateRecordIterable = this.exchangeRateRecordDao.findAll();
		exchangeRateRecordIterable.forEach(exchangeRateRecords::add);
		return exchangeRateRecords;
	}

	public boolean save(ExchangeRateRecord entity) {
		this.exchangeRateRecordDao.save(entity);
		return true;
	}

	public boolean saveAll(List<ExchangeRateRecord> entities) {
		this.exchangeRateRecordDao.saveAll(entities);
		return true;
	}

	public boolean delete(ExchangeRateRecord entity) {
		this.exchangeRateRecordDao.delete(entity);
		return true;
	}

	public boolean delete(UUID id) {
		this.exchangeRateRecordDao.deleteById(id);
		return true;
	}

	public ExchangeRateRecord lastestRecord(String currency) {
		Optional<ExchangeRateRecord> record = this.exchangeRateRecordDao.findFirstByCurrencyOrderByDateDesc(currency);
		if (record.isPresent()) {
			return record.get();
		} else {
			return null;
		}
	}
}
