package io.tingkai.money.facade;

import java.text.MessageFormat;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import io.netty.util.internal.StringUtil;
import io.tingkai.money.constant.DatabaseConstants;
import io.tingkai.money.constant.MessageConstant;
import io.tingkai.money.dao.ExchangeRateDao;
import io.tingkai.money.entity.ExchangeRate;
import io.tingkai.money.model.exception.AlreadyExistException;
import io.tingkai.money.model.exception.FieldMissingException;
import io.tingkai.money.model.exception.NotExistException;
import io.tingkai.money.util.AppUtil;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class ExchangeRateFacade {

	@Autowired
	private ExchangeRateDao exchangeRateDao;

	public List<ExchangeRate> queryAll() {
		List<ExchangeRate> entities = this.exchangeRateDao.findAll();
		if (entities.size() == 0) {
			log.trace(MessageFormat.format(MessageConstant.QUERY_NO_DATA, DatabaseConstants.TABLE_EXCHANGE_RATE_RECORD));
		}
		return entities;
	}

	public ExchangeRate query(String id) {
		Optional<ExchangeRate> optional = this.exchangeRateDao.findById(id);
		if (optional.isEmpty()) {
			log.trace(MessageFormat.format(MessageConstant.QUERY_NO_DATA, DatabaseConstants.TABLE_EXCHANGE_RATE_RECORD));
		}
		return optional.get();
	}

	public ExchangeRate insert(ExchangeRate entity) throws AlreadyExistException, FieldMissingException {
		if (!AppUtil.isAllPresent(entity, entity.getCurrency(), entity.getName())) {
			throw new FieldMissingException();
		}
		Optional<ExchangeRate> optional = this.exchangeRateDao.findById(entity.getCurrency());
		if (optional.isPresent()) {
			throw new AlreadyExistException();
		}
		return this.exchangeRateDao.save(entity);
	}

	public List<ExchangeRate> insertAll(List<ExchangeRate> entities) throws AlreadyExistException, FieldMissingException {
		long hasFieldMissingCount = entities.stream().filter(entity -> !AppUtil.isAllPresent(entity, entity.getCurrency(), entity.getName())).count();
		if (hasFieldMissingCount > 0L) {
			throw new FieldMissingException();
		}
		return this.exchangeRateDao.saveAll(entities);
	}

	public ExchangeRate update(ExchangeRate entity) throws NotExistException, FieldMissingException {
		if (!AppUtil.isAllPresent(entity, entity.getCurrency())) {
			throw new FieldMissingException();
		}
		Optional<ExchangeRate> optional = this.exchangeRateDao.findById(entity.getCurrency());
		if (optional.isEmpty()) {
			throw new NotExistException();
		}
		ExchangeRate updateEntity = optional.get();
		updateEntity.setName(entity.getName());
		return this.exchangeRateDao.save(updateEntity);
	}

	public void delete(String id) throws NotExistException {
		if (StringUtil.isNullOrEmpty(id)) {
			throw new NotExistException();
		}
		Optional<ExchangeRate> optional = this.exchangeRateDao.findById(id);
		if (optional.isEmpty()) {
			throw new NotExistException();
		}
		this.exchangeRateDao.delete(optional.get());
	}

	public long count() {
		return this.exchangeRateDao.count();
	}
}
