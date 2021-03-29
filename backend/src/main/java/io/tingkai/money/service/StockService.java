package io.tingkai.money.service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import io.netty.util.internal.StringUtil;
import io.tingkai.money.constant.DatabaseConstants;
import io.tingkai.money.dao.StockDao;
import io.tingkai.money.entity.Stock;
import io.tingkai.money.enumeration.MarketType;
import io.tingkai.money.model.exception.AlreadyExistException;
import io.tingkai.money.model.exception.FieldMissingException;
import io.tingkai.money.model.exception.NotExistException;
import io.tingkai.money.model.exception.QueryNotResultException;
import io.tingkai.money.util.AppUtil;

/**
 * provide method for upload, download, find, delete database table 'stock'
 * 
 * @author tingkai
 */
@Service
public class StockService {

	@Autowired
	private StockDao stockDao;

	public List<Stock> getAll() throws QueryNotResultException {
		List<Stock> entities = new ArrayList<Stock>();
		Iterable<Stock> iterable = this.stockDao.findAll();
		iterable.forEach(entities::add);
		if (entities.size() == 0) {
			throw new QueryNotResultException(DatabaseConstants.TABLE_STOCK);
		}
		return entities;
	}

	public Stock get(String code) throws QueryNotResultException {
		Optional<Stock> optional = this.stockDao.findByCode(code);
		if (optional.isEmpty()) {
			throw new QueryNotResultException(DatabaseConstants.TABLE_ACCOUNT_RECORD);
		}
		return optional.get();
	}

	public Stock insert(Stock entity) throws AlreadyExistException, FieldMissingException {
		if (!AppUtil.isAllPresent(entity, entity.getCode(), entity.getName(), entity.getIsinCode(), entity.getOfferingDate(), entity.getCfiCode())) {
			throw new FieldMissingException();
		}
		Optional<Stock> optional = this.stockDao.findByCode(entity.getCode());
		if (optional.isPresent()) {
			throw new AlreadyExistException();
		}
		return this.stockDao.save(entity);
	}

	public List<Stock> insertAll(List<Stock> entities) throws AlreadyExistException, FieldMissingException {
		List<Stock> inserted = new ArrayList<Stock>();
		for (Stock entity : entities) {
			inserted.add(this.insert(entity));
		}
		return inserted;
	}

	public void delete(UUID id) throws NotExistException {
		if (AppUtil.isEmpty(id) || StringUtil.isNullOrEmpty(id.toString())) {
			throw new NotExistException();
		}
		Optional<Stock> optional = this.stockDao.findById(id);
		if (optional.isEmpty()) {
			throw new NotExistException();
		}
		this.stockDao.deleteById(id);
	}

	public long count() {
		return this.stockDao.count();
	}

	public long countByMarketType(MarketType marketType) {
		return this.stockDao.countByMarketType(marketType);
	}
}
