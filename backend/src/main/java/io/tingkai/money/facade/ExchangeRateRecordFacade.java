package io.tingkai.money.facade;

import java.text.MessageFormat;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import io.tingkai.base.model.exception.AlreadyExistException;
import io.tingkai.base.model.exception.FieldMissingException;
import io.tingkai.base.model.exception.NotExistException;
import io.tingkai.base.util.BaseAppUtil;
import io.tingkai.money.constant.DatabaseConstant;
import io.tingkai.money.constant.MessageConstant;
import io.tingkai.money.dao.ExchangeRateRecordDao;
import io.tingkai.money.entity.ExchangeRateRecord;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class ExchangeRateRecordFacade {

	@Autowired
	private ExchangeRateRecordDao exchangeRateRecordDao;

	public List<ExchangeRateRecord> queryAll(String currency) {
		List<ExchangeRateRecord> entities = this.exchangeRateRecordDao.findByCurrencyOrderByDate(currency);
		if (entities.size() == 0) {
			log.trace(MessageFormat.format(MessageConstant.QUERY_NO_DATA, DatabaseConstant.TABLE_EXCHANGE_RATE_RECORD));
		}
		return entities;
	}

	public List<ExchangeRateRecord> queryAll(String currency, LocalDateTime start, LocalDateTime end) {
		List<ExchangeRateRecord> entities = this.exchangeRateRecordDao.findByCurrencyAndDateBetweenOrderByDate(currency, start, end);
		if (entities.size() == 0) {
			log.trace(MessageFormat.format(MessageConstant.QUERY_NO_DATA, DatabaseConstant.TABLE_EXCHANGE_RATE_RECORD));
		}
		return entities;
	}

	public ExchangeRateRecord query(UUID id) {
		Optional<ExchangeRateRecord> optional = this.exchangeRateRecordDao.findById(id);
		if (optional.isEmpty()) {
			log.trace(MessageFormat.format(MessageConstant.QUERY_NO_DATA, DatabaseConstant.TABLE_EXCHANGE_RATE_RECORD));
		}
		return optional.get();
	}

	public ExchangeRateRecord queryNewestRecord(String currency) {
		Optional<ExchangeRateRecord> optional = this.exchangeRateRecordDao.findFirstByCurrencyOrderByDateDesc(currency);
		if (optional.isEmpty()) {
			log.trace(MessageFormat.format(MessageConstant.QUERY_NO_DATA, DatabaseConstant.TABLE_EXCHANGE_RATE_RECORD));
		}
		return optional.get();
	}

	public List<ExchangeRateRecord> queryDaysBefore(String currency, int days, LocalDateTime date) {
		List<ExchangeRateRecord> entities = this.exchangeRateRecordDao.findByCurrencyAndDateBeforeOrderByDateDesc(currency, date, PageRequest.of(0, days));
		if (entities.size() == 0) {
			log.trace(MessageFormat.format(MessageConstant.QUERY_NO_DATA, DatabaseConstant.TABLE_EXCHANGE_RATE_RECORD));
		}
		Collections.reverse(entities);
		return entities;
	}

	public ExchangeRateRecord insert(ExchangeRateRecord entity) throws AlreadyExistException, FieldMissingException {
		if (!BaseAppUtil.isAllPresent(entity, entity.getCurrency(), entity.getDate())) {
			throw new FieldMissingException();
		}
		Optional<ExchangeRateRecord> optional = this.exchangeRateRecordDao.findByCurrencyAndDate(entity.getCurrency(), entity.getDate());
		if (optional.isPresent()) {
			throw new AlreadyExistException();
		}
		return this.exchangeRateRecordDao.save(entity);
	}

	public List<ExchangeRateRecord> insertAll(List<ExchangeRateRecord> entities) throws AlreadyExistException, FieldMissingException {
		long hasFieldMissingCount = entities.stream().filter(entity -> !BaseAppUtil.isAllPresent(entity, entity.getCurrency(), entity.getDate())).count();
		if (hasFieldMissingCount > 0L) {
			throw new FieldMissingException();
		}
		return this.exchangeRateRecordDao.saveAll(entities);
	}

	public ExchangeRateRecord update(ExchangeRateRecord entity) throws NotExistException, FieldMissingException {
		if (!BaseAppUtil.isAllPresent(entity, entity.getId())) {
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
		if (!BaseAppUtil.isAllPresent(id)) {
			throw new NotExistException();
		}
		Optional<ExchangeRateRecord> optional = this.exchangeRateRecordDao.findById(id);
		if (optional.isEmpty()) {
			throw new NotExistException();
		}
		this.exchangeRateRecordDao.delete(optional.get());
	}

	public ExchangeRateRecord latestRecord(String currency) {
		Optional<ExchangeRateRecord> optional = this.exchangeRateRecordDao.findFirstByCurrencyOrderByDateDesc(currency);
		if (optional.isEmpty()) {
			log.trace(MessageFormat.format(MessageConstant.QUERY_NO_DATA, DatabaseConstant.TABLE_EXCHANGE_RATE_RECORD));
			return null;
		}
		return optional.get();
	}
}
