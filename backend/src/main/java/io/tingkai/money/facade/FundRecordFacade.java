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
import io.tingkai.money.dao.FundRecordDao;
import io.tingkai.money.entity.FundRecord;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class FundRecordFacade {

	@Autowired
	private FundRecordDao fundRecordDao;

	public List<FundRecord> queryAll(String code) {
		List<FundRecord> entities = this.fundRecordDao.findByCodeOrderByDate(code);
		if (entities.size() == 0) {
			log.trace(MessageFormat.format(MessageConstant.QUERY_NO_DATA, DatabaseConstant.TABLE_FUND_RECORD));
		}
		return entities;
	}

	public List<FundRecord> queryAll(String code, LocalDateTime start, LocalDateTime end) {
		List<FundRecord> entities = this.fundRecordDao.findByCodeAndDateBetweenOrderByDate(code, start, end);
		if (entities.size() == 0) {
			log.trace(MessageFormat.format(MessageConstant.QUERY_NO_DATA, DatabaseConstant.TABLE_FUND_RECORD));
		}
		return entities;
	}

	public List<FundRecord> queryDaysBefore(String code, int days, LocalDateTime date) {
		List<FundRecord> entities = this.fundRecordDao.findByCodeAndDateBeforeOrderByDateDesc(code, date, PageRequest.of(0, days));
		if (entities.size() == 0) {
			log.trace(MessageFormat.format(MessageConstant.QUERY_NO_DATA, DatabaseConstant.TABLE_FUND_RECORD));
		}
		Collections.reverse(entities);
		return entities;
	}

	public FundRecord query(UUID id) {
		Optional<FundRecord> optional = this.fundRecordDao.findById(id);
		if (optional.isEmpty()) {
			log.trace(MessageFormat.format(MessageConstant.QUERY_NO_DATA, DatabaseConstant.TABLE_FUND_RECORD));
		}
		return optional.get();
	}

	public FundRecord insert(FundRecord entity) throws AlreadyExistException, FieldMissingException {
		if (!BaseAppUtil.isAllPresent(entity, entity.getCode(), entity.getDate())) {
			throw new FieldMissingException();
		}
		Optional<FundRecord> optional = this.fundRecordDao.findByCodeAndDate(entity.getCode(), entity.getDate());
		if (optional.isPresent()) {
			throw new AlreadyExistException();
		}
		return this.fundRecordDao.save(entity);
	}

	public List<FundRecord> insertAll(List<FundRecord> entities) throws AlreadyExistException, FieldMissingException {
		long hasFieldMissingCount = entities.stream().filter(entity -> !BaseAppUtil.isAllPresent(entity, entity.getCode(), entity.getDate())).count();
		if (hasFieldMissingCount > 0L) {
			throw new FieldMissingException();
		}
		return this.fundRecordDao.saveAll(entities);
	}

	public FundRecord update(FundRecord entity) throws NotExistException, FieldMissingException {
		if (!BaseAppUtil.isAllPresent(entity, entity.getId())) {
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
			log.trace(MessageFormat.format(MessageConstant.QUERY_NO_DATA, DatabaseConstant.TABLE_FUND_RECORD));
			return null;
		}
		return optional.get();
	}
}
