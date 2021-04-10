package io.tingkai.money.facade;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import io.tingkai.money.constant.DatabaseConstants;
import io.tingkai.money.dao.UserStockRecordDao;
import io.tingkai.money.entity.UserStockRecord;
import io.tingkai.money.model.exception.AlreadyExistException;
import io.tingkai.money.model.exception.FieldMissingException;
import io.tingkai.money.model.exception.NotExistException;
import io.tingkai.money.model.exception.QueryNotResultException;
import io.tingkai.money.util.AppUtil;

@Service
public class UserStockRecordFacade {

	@Autowired
	private UserStockRecordDao userStockRecordDao;

	public List<UserStockRecord> queryAll() throws QueryNotResultException {
		List<UserStockRecord> entities = new ArrayList<UserStockRecord>();
		Iterable<UserStockRecord> iterable = this.userStockRecordDao.findAll();
		iterable.forEach(entities::add);
		if (entities.size() == 0) {
			throw new QueryNotResultException(DatabaseConstants.TABLE_USER_STOCK_RECORD);
		}
		return entities;
	}

	public List<UserStockRecord> queryAll(List<UUID> userStockIds) throws QueryNotResultException {
		List<UserStockRecord> entities = new ArrayList<UserStockRecord>();
		Iterable<UserStockRecord> iterable = this.userStockRecordDao.findByUserStockIdIn(userStockIds);
		iterable.forEach(entities::add);
		if (entities.size() == 0) {
			throw new QueryNotResultException(DatabaseConstants.TABLE_USER_STOCK_RECORD);
		}
		return entities;
	}

	public List<UserStockRecord> queryByAccountId(UUID accountId) throws QueryNotResultException {
		List<UserStockRecord> entities = new ArrayList<UserStockRecord>();
		Iterable<UserStockRecord> iterable = this.userStockRecordDao.findByAccountId(accountId);
		iterable.forEach(entities::add);
		if (entities.size() == 0) {
			throw new QueryNotResultException(DatabaseConstants.TABLE_USER_STOCK_RECORD);
		}
		return entities;
	}

	public UserStockRecord query(UUID id) throws QueryNotResultException {
		Optional<UserStockRecord> optional = this.userStockRecordDao.findById(id);
		if (optional.isEmpty()) {
			throw new QueryNotResultException(DatabaseConstants.TABLE_USER_STOCK_RECORD);
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
