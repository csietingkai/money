package io.tingkai.money.service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import io.tingkai.money.dao.StockDao;
import io.tingkai.money.entity.Stock;
import io.tingkai.money.enumeration.MarketType;

/**
 * provide method for upload, download, find, delete database table 'stock'
 * 
 * @author tingkai
 */
@Service
public class StockService {

	@Autowired
	private StockDao stockDao;

	public List<Stock> getAll() {
		List<Stock> stocks = new ArrayList<Stock>();
		Iterable<Stock> stockIterable = this.stockDao.findAll();
		stockIterable.forEach(stocks::add);
		return stocks;
	}

	public Stock get(UUID id) {
		Optional<Stock> stockOptional = this.stockDao.findById(id);
		if (stockOptional.isPresent()) {
			return stockOptional.get();
		} else {
			return null;
		}
	}

	public Stock get(String code) {
		Optional<Stock> stockOptional = this.stockDao.findByCode(code);
		if (stockOptional.isPresent()) {
			return stockOptional.get();
		} else {
			return null;
		}
	}

	public boolean save(Stock entity) {
		this.stockDao.save(entity);
		return true;
	}

	public boolean saveAll(List<Stock> entities) {
		this.stockDao.saveAll(entities);
		return true;
	}

	public boolean delete(UUID id) {
		this.stockDao.deleteById(id);
		return true;
	}

	public boolean delete(Stock entity) {
		this.stockDao.delete(entity);
		return true;
	}

	public long count() {
		return this.stockDao.count();
	}

	public long countByMarketType(MarketType marketType) {
		return this.stockDao.countByMarketType(marketType);
	}
}
