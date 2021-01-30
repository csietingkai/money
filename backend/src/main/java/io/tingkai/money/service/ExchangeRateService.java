package io.tingkai.money.service;

import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import io.tingkai.money.dao.ExchangeRateDao;
import io.tingkai.money.entity.ExchangeRate;

/**
 * provide method for get single or multiple data from database table
 * 'exchange_rate'
 * 
 * @author tingkai
 */
@Service
public class ExchangeRateService {

	@Autowired
	private ExchangeRateDao exchangeRateDao;

	public List<ExchangeRate> getAll() {
		List<ExchangeRate> exchangeRates = new ArrayList<ExchangeRate>();
		Iterable<ExchangeRate> exchangeRateIterable = this.exchangeRateDao.findAll();
		exchangeRateIterable.forEach(exchangeRates::add);
		return exchangeRates;
	}

	public boolean save(ExchangeRate entity) {
		this.exchangeRateDao.save(entity);
		return true;
	}

	public boolean saveAll(List<ExchangeRate> entities) {
		this.exchangeRateDao.saveAll(entities);
		return true;
	}

	public boolean delete(ExchangeRate entity) {
		this.exchangeRateDao.delete(entity);
		return true;
	}

	public boolean delete(String id) {
		this.exchangeRateDao.deleteById(id);
		return true;
	}

	public long count() {
		return this.exchangeRateDao.count();
	}
}
