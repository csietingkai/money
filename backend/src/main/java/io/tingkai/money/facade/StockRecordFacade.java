package io.tingkai.money.facade;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import io.tingkai.money.constant.DatabaseConstants;
import io.tingkai.money.dao.StockRecordDao;
import io.tingkai.money.entity.StockRecord;
import io.tingkai.money.model.exception.AlreadyExistException;
import io.tingkai.money.model.exception.FieldMissingException;
import io.tingkai.money.model.exception.NotExistException;
import io.tingkai.money.model.exception.QueryNotResultException;
import io.tingkai.money.util.AppUtil;
import io.tingkai.money.util.TimeUtil;

@Service
public class StockRecordFacade {

	@Autowired
	private StockRecordDao stockRecordDao;

	public List<StockRecord> queryAll(String code) throws QueryNotResultException {
		List<StockRecord> entities = this.stockRecordDao.findByCodeOrderByDealDate(code);
		if (entities.size() == 0) {
			throw new QueryNotResultException(DatabaseConstants.TABLE_STOCK_RECORD);
		}
		return entities;
	}

	public List<StockRecord> queryAll(String code, long start, long end) throws QueryNotResultException {
		List<StockRecord> entities = this.stockRecordDao.findByCodeAndDealDateBetweenOrderByDealDate(code, TimeUtil.convertToDateTime(start), TimeUtil.convertToDateTime(end));
		if (entities.size() == 0) {
			throw new QueryNotResultException(DatabaseConstants.TABLE_STOCK_RECORD);
		}
		return entities;
	}

	public StockRecord query(UUID id) throws QueryNotResultException {
		Optional<StockRecord> optional = this.stockRecordDao.findById(id);
		if (optional.isEmpty()) {
			throw new QueryNotResultException(DatabaseConstants.TABLE_STOCK_RECORD);
		}
		return optional.get();
	}

	public StockRecord insert(StockRecord entity) throws AlreadyExistException, FieldMissingException {
		if (!AppUtil.isAllPresent(entity, entity.getCode(), entity.getDealDate())) {
			throw new FieldMissingException();
		}
		Optional<StockRecord> optional = this.stockRecordDao.findByCodeAndDealDate(entity.getCode(), entity.getDealDate());
		if (optional.isPresent()) {
			throw new AlreadyExistException();
		}
		return this.stockRecordDao.save(entity);
	}

	public List<StockRecord> insertAll(List<StockRecord> entities) throws AlreadyExistException, FieldMissingException {
		long hasFieldMissingCount = entities.stream().filter(entity -> !AppUtil.isAllPresent(entity, entity.getCode(), entity.getDealDate())).count();
		if (hasFieldMissingCount > 0L) {
			throw new FieldMissingException();
		}
		return this.stockRecordDao.saveAll(entities);
	}

	public StockRecord update(StockRecord entity) throws NotExistException, FieldMissingException {
		if (!AppUtil.isAllPresent(entity, entity.getId())) {
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

	public StockRecord latestRecord(String code) throws QueryNotResultException {
		Optional<StockRecord> optional = this.stockRecordDao.findFirstByCodeOrderByDealDateDesc(code);
		if (optional.isPresent()) {
			return optional.get();
		} else {
			throw new QueryNotResultException(DatabaseConstants.TABLE_STOCK_RECORD);
		}
	}
}
