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
import io.tingkai.money.dao.StockRecordDao;
import io.tingkai.money.entity.StockRecord;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class StockRecordFacade {

	@Autowired
	private StockRecordDao stockRecordDao;

	public List<StockRecord> queryAll(String code) {
		List<StockRecord> entities = this.stockRecordDao.findByCodeOrderByDealDate(code);
		if (entities.size() == 0) {
			log.trace(MessageFormat.format(MessageConstant.QUERY_NO_DATA, DatabaseConstant.TABLE_STOCK_RECORD));
		}
		return entities;
	}

	public List<StockRecord> queryAll(String code, LocalDateTime start, LocalDateTime end) {
		List<StockRecord> entities = this.stockRecordDao.findByCodeAndDealDateBetweenOrderByDealDate(code, start, end);
		if (entities.size() == 0) {
			log.trace(MessageFormat.format(MessageConstant.QUERY_NO_DATA, DatabaseConstant.TABLE_STOCK_RECORD));
		}
		return entities;
	}

	public List<StockRecord> queryDaysBefore(String code, int days, LocalDateTime date) {
		List<StockRecord> entities = this.stockRecordDao.findByCodeAndDealDateBeforeOrderByDealDateDesc(code, date, PageRequest.of(0, days));
		if (entities.size() == 0) {
			log.trace(MessageFormat.format(MessageConstant.QUERY_NO_DATA, DatabaseConstant.TABLE_STOCK_RECORD));
		}
		Collections.reverse(entities);
		return entities;
	}

	public StockRecord query(UUID id) {
		Optional<StockRecord> optional = this.stockRecordDao.findById(id);
		if (optional.isEmpty()) {
			log.trace(MessageFormat.format(MessageConstant.QUERY_NO_DATA, DatabaseConstant.TABLE_STOCK_RECORD));
		}
		return optional.get();
	}

	public StockRecord insert(StockRecord entity) throws AlreadyExistException, FieldMissingException {
		if (!BaseAppUtil.isAllPresent(entity, entity.getCode(), entity.getDealDate())) {
			throw new FieldMissingException();
		}
		Optional<StockRecord> optional = this.stockRecordDao.findByCodeAndDealDate(entity.getCode(), entity.getDealDate());
		if (optional.isPresent()) {
			throw new AlreadyExistException();
		}
		return this.stockRecordDao.save(entity);
	}

	public List<StockRecord> insertAll(List<StockRecord> entities) throws AlreadyExistException, FieldMissingException {
		long hasFieldMissingCount = entities.stream().filter(entity -> !BaseAppUtil.isAllPresent(entity, entity.getCode(), entity.getDealDate())).count();
		if (hasFieldMissingCount > 0L) {
			throw new FieldMissingException();
		}
		return this.stockRecordDao.saveAll(entities);
	}

	public StockRecord update(StockRecord entity) throws NotExistException, FieldMissingException {
		if (!BaseAppUtil.isAllPresent(entity, entity.getId())) {
			throw new FieldMissingException();
		}
		Optional<StockRecord> optional = this.stockRecordDao.findById(entity.getId());
		if (optional.isEmpty()) {
			throw new NotExistException();
		}
		StockRecord updateEntity = optional.get();
		updateEntity.setCode(entity.getCode());
		updateEntity.setDealDate(entity.getDealDate());
		updateEntity.setDealShare(entity.getDealShare());
		updateEntity.setOpenPrice(entity.getOpenPrice());
		updateEntity.setHighPrice(entity.getHighPrice());
		updateEntity.setLowPrice(entity.getLowPrice());
		updateEntity.setClosePrice(entity.getClosePrice());
		return this.stockRecordDao.save(updateEntity);
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

	public StockRecord latestRecord(String code) {
		Optional<StockRecord> optional = this.stockRecordDao.findFirstByCodeOrderByDealDateDesc(code);
		if (optional.isEmpty()) {
			log.trace(MessageFormat.format(MessageConstant.QUERY_NO_DATA, DatabaseConstant.TABLE_STOCK_RECORD));
			return null;
		}
		return optional.get();
	}
}
