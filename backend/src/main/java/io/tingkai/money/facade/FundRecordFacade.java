package io.tingkai.money.facade;

import java.text.MessageFormat;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import io.tingkai.money.constant.DatabaseConstants;
import io.tingkai.money.constant.MessageConstant;
import io.tingkai.money.dao.FundRecordDao;
import io.tingkai.money.entity.FundRecord;
import io.tingkai.money.model.exception.AlreadyExistException;
import io.tingkai.money.model.exception.FieldMissingException;
import io.tingkai.money.model.exception.NotExistException;
import io.tingkai.money.util.AppUtil;
import io.tingkai.money.util.TimeUtil;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class FundRecordFacade {

	@Autowired
	private FundRecordDao fundRecordDao;

	public List<FundRecord> queryAll(String code) {
		List<FundRecord> entities = this.fundRecordDao.findByCodeOrderByDate(code);
		if (entities.size() == 0) {
			log.trace(MessageFormat.format(MessageConstant.QUERY_NO_DATA, DatabaseConstants.TABLE_FUND_RECORD));
		}
		return entities;
	}

	public List<FundRecord> queryAll(String code, long start, long end) {
		List<FundRecord> entities = this.fundRecordDao.findByCodeAndDateBetweenOrderByDate(code, TimeUtil.convertToDateTime(start), TimeUtil.convertToDateTime(end));
		if (entities.size() == 0) {
			log.trace(MessageFormat.format(MessageConstant.QUERY_NO_DATA, DatabaseConstants.TABLE_FUND_RECORD));
		}
		return entities;
	}

	public List<FundRecord> queryDaysBefore(String code, int days, long date) {
		List<FundRecord> entities = this.fundRecordDao.findByCodeAndDateBeforeOrderByDateDesc(code, TimeUtil.convertToDateTime(date), PageRequest.of(0, days));
		if (entities.size() == 0) {
			log.trace(MessageFormat.format(MessageConstant.QUERY_NO_DATA, DatabaseConstants.TABLE_FUND_RECORD));
		}
		Collections.reverse(entities);
		return entities;
	}

	public FundRecord query(UUID id) {
		Optional<FundRecord> optional = this.fundRecordDao.findById(id);
		if (optional.isEmpty()) {
			log.trace(MessageFormat.format(MessageConstant.QUERY_NO_DATA, DatabaseConstants.TABLE_FUND_RECORD));
		}
		return optional.get();
	}

	public FundRecord insert(FundRecord entity) throws AlreadyExistException, FieldMissingException {
		if (!AppUtil.isAllPresent(entity, entity.getCode(), entity.getDate())) {
			throw new FieldMissingException();
		}
		Optional<FundRecord> optional = this.fundRecordDao.findByCodeAndDate(entity.getCode(), entity.getDate());
		if (optional.isPresent()) {
			throw new AlreadyExistException();
		}
		return this.fundRecordDao.save(entity);
	}

	public List<FundRecord> insertAll(List<FundRecord> entities) throws AlreadyExistException, FieldMissingException {
		long hasFieldMissingCount = entities.stream().filter(entity -> !AppUtil.isAllPresent(entity, entity.getCode(), entity.getDate())).count();
		if (hasFieldMissingCount > 0L) {
			throw new FieldMissingException();
		}
		return this.fundRecordDao.saveAll(entities);
	}

	public FundRecord update(FundRecord entity) throws NotExistException, FieldMissingException {
		if (!AppUtil.isAllPresent(entity, entity.getId())) {
			throw new FieldMissingException();
		}
		Optional<FundRecord> optional = this.fundRecordDao.findById(entity.getId());
		if (optional.isEmpty()) {
			throw new NotExistException();
		}
		FundRecord updateEntity = optional.get();
		updateEntity.setPrice(entity.getPrice());
		return this.fundRecordDao.save(updateEntity);
	}

	public boolean delete(UUID id) {
		this.fundRecordDao.deleteById(id);
		return true;
	}

	public boolean delete(FundRecord entity) {
		this.fundRecordDao.delete(entity);
		return true;
	}

	public long count() {
		return this.fundRecordDao.count();
	}

	public FundRecord latestRecord(String code) {
		Optional<FundRecord> optional = this.fundRecordDao.findFirstByCodeOrderByDateDesc(code);
		if (optional.isEmpty()) {
			log.trace(MessageFormat.format(MessageConstant.QUERY_NO_DATA, DatabaseConstants.TABLE_FUND_RECORD));
			return null;
		}
		return optional.get();
	}
}
