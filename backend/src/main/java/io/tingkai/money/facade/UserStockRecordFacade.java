package io.tingkai.money.facade;

import java.text.MessageFormat;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import io.tingkai.money.constant.DatabaseConstants;
import io.tingkai.money.constant.MessageConstant;
import io.tingkai.money.dao.UserStockRecordDao;
import io.tingkai.money.entity.UserStockRecord;
import io.tingkai.money.model.exception.AlreadyExistException;
import io.tingkai.money.model.exception.FieldMissingException;
import io.tingkai.money.model.exception.NotExistException;
import io.tingkai.money.util.AppUtil;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class UserStockRecordFacade {

	@Autowired
	private UserStockRecordDao userStockRecordDao;

	public List<UserStockRecord> queryAll() {
		List<UserStockRecord> entities = this.userStockRecordDao.findAll();
		if (entities.size() == 0) {
			log.trace(MessageFormat.format(MessageConstant.QUERY_NO_DATA, DatabaseConstants.TABLE_USER_STOCK_RECORD));
		}
		return entities;
	}

	public List<UserStockRecord> queryAll(List<UUID> userStockIds) {
		List<UserStockRecord> entities = this.userStockRecordDao.findByUserStockIdIn(userStockIds);
		if (entities.size() == 0) {
			log.trace(MessageFormat.format(MessageConstant.QUERY_NO_DATA, DatabaseConstants.TABLE_USER_STOCK_RECORD));
		}
		return entities;
	}

	public List<UserStockRecord> queryByAccountId(UUID accountId) {
		List<UserStockRecord> entities = this.userStockRecordDao.findByAccountId(accountId);
		if (entities.size() == 0) {
			log.trace(MessageFormat.format(MessageConstant.QUERY_NO_DATA, DatabaseConstants.TABLE_USER_STOCK_RECORD));
		}
		return entities;
	}

	public UserStockRecord query(UUID id) {
		Optional<UserStockRecord> optional = this.userStockRecordDao.findById(id);
		if (optional.isEmpty()) {
			log.trace(MessageFormat.format(MessageConstant.QUERY_NO_DATA, DatabaseConstants.TABLE_USER_STOCK_RECORD));
		}
		return optional.get();
	}

	public UserStockRecord insert(UserStockRecord entity) throws AlreadyExistException, FieldMissingException {
		if (!AppUtil.isAllPresent(entity, entity.getUserStockId(), entity.getAccountId(), entity.getDate(), entity.getType(), entity.getPrice(), entity.getShare())) {
			throw new FieldMissingException();
		}
		return this.userStockRecordDao.save(entity);
	}

	public UserStockRecord update(UserStockRecord entity) throws NotExistException, FieldMissingException {
		if (!AppUtil.isAllPresent(entity, entity.getId())) {
			throw new FieldMissingException();
		}
		Optional<UserStockRecord> optional = this.userStockRecordDao.findById(entity.getId());
		if (optional.isEmpty()) {
			throw new NotExistException();
		}
		UserStockRecord updateEntity = optional.get();
		updateEntity.setUserStockId(entity.getUserStockId());
		updateEntity.setAccountId(entity.getAccountId());
		updateEntity.setType(entity.getType());
		updateEntity.setDate(entity.getDate());
		updateEntity.setShare(entity.getShare());
		updateEntity.setPrice(entity.getPrice());
		updateEntity.setFee(entity.getFee());
		updateEntity.setTax(entity.getTax());
		return this.userStockRecordDao.save(updateEntity);
	}

	public void delete(UUID id) throws NotExistException {
		if (!AppUtil.isAllPresent(id)) {
			throw new NotExistException();
		}
		Optional<UserStockRecord> optional = this.userStockRecordDao.findById(id);
		if (optional.isEmpty()) {
			throw new NotExistException();
		}
		this.userStockRecordDao.delete(optional.get());
	}
}
