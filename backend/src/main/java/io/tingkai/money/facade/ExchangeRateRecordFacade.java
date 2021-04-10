package io.tingkai.money.facade;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import io.tingkai.money.constant.DatabaseConstants;
import io.tingkai.money.dao.ExchangeRateRecordDao;
import io.tingkai.money.entity.ExchangeRateRecord;
import io.tingkai.money.model.exception.AlreadyExistException;
import io.tingkai.money.model.exception.FieldMissingException;
import io.tingkai.money.model.exception.NotExistException;
import io.tingkai.money.model.exception.QueryNotResultException;
import io.tingkai.money.util.AppUtil;

@Service
public class ExchangeRateRecordFacade {

	@Autowired
	private ExchangeRateRecordDao exchangeRateRecordDao;

	public List<ExchangeRateRecord> queryAll() throws QueryNotResultException {
		List<ExchangeRateRecord> entities = new ArrayList<ExchangeRateRecord>();
		Iterable<ExchangeRateRecord> iterable = this.exchangeRateRecordDao.findAll();
		iterable.forEach(entities::add);
		if (entities.size() == 0) {
			throw new QueryNotResultException(DatabaseConstants.TABLE_EXCHANGE_RATE_RECORD);
		}
		return entities;
	}

	public ExchangeRateRecord query(UUID id) throws QueryNotResultException {
		Optional<ExchangeRateRecord> optional = this.exchangeRateRecordDao.findById(id);
		if (optional.isEmpty()) {
			throw new QueryNotResultException(DatabaseConstants.TABLE_EXCHANGE_RATE_RECORD);
		}
		return optional.get();
	}

	public ExchangeRateRecord queryNewestRecord(String currency) throws QueryNotResultException {
		Optional<ExchangeRateRecord> optional = this.exchangeRateRecordDao.findFirstByCurrencyOrderByDateDesc(currency);
		if (optional.isEmpty()) {
			throw new QueryNotResultException(DatabaseConstants.TABLE_EXCHANGE_RATE_RECORD);
		}
		return optional.get();
	}

	public ExchangeRateRecord insert(ExchangeRateRecord entity) throws AlreadyExistException, FieldMissingException {
		if (!AppUtil.isAllPresent(entity, entity.getCurrency(), entity.getDate())) {
			throw new FieldMissingException();
		}
		Optional<ExchangeRateRecord> optional = this.exchangeRateRecordDao.findByCurrencyAndDate(entity.getCurrency(), entity.getDate());
		if (optional.isPresent()) {
			throw new AlreadyExistException();
		}
		return this.exchangeRateRecordDao.save(entity);
	}

	public List<ExchangeRateRecord> insertAll(List<ExchangeRateRecord> entities) throws AlreadyExistException, FieldMissingException {
		long hasFieldMissingCount = entities.stream().filter(entity -> !AppUtil.isAllPresent(entity, entity.getCurrency(), entity.getDate())).count();
		if (hasFieldMissingCount > 0L) {
			throw new FieldMissingException();
		}
		return this.exchangeRateRecordDao.saveAll(entities);
	}

	public ExchangeRateRecord update(ExchangeRateRecord entity) throws NotExistException, FieldMissingException {
		if (!AppUtil.isAllPresent(entity, entity.getId())) {
			throw new FieldMissingException();
		}
		Optional<ExchangeRateRecord> optional = this.exchangeRateRecordDao.findById(entity.getId());
		if (optional.isEmpty()) {
			throw new NotExistException();
		}
		ExchangeRateRecord updateEntity = optional.get();
		updateEntity.setCurrency(entity.getCurrency());
		updateEntity.setDate(entity.getDate());
		updateEntity.setCashBuy(entity.getCashBuy());
		updateEntity.setCashSell(entity.getCashSell());
		updateEntity.setSpotBuy(entity.getSpotBuy());
		updateEntity.setSpotSell(entity.getSpotSell());
		return this.exchangeRateRecordDao.save(updateEntity);
	}

	public void delete(UUID id) throws NotExistException {
		if (!AppUtil.isAllPresent(id)) {
			throw new NotExistException();
		}
		Optional<ExchangeRateRecord> optional = this.exchangeRateRecordDao.findById(id);
		if (optional.isEmpty()) {
			throw new NotExistException();
		}
		this.exchangeRateRecordDao.delete(optional.get());
	}
}