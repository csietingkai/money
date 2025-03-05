package io.tingkai.money.facade;

import java.text.MessageFormat;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import io.tingkai.base.model.exception.AlreadyExistException;
import io.tingkai.base.model.exception.FieldMissingException;
import io.tingkai.base.model.exception.NotExistException;
import io.tingkai.base.util.BaseAppUtil;
import io.tingkai.money.constant.AppConstant;
import io.tingkai.money.constant.DatabaseConstant;
import io.tingkai.money.constant.MessageConstant;
import io.tingkai.money.dao.UserStockRecordDao;
import io.tingkai.money.entity.UserStockRecord;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class UserStockRecordFacade {

	@Autowired
	private UserStockRecordDao userStockRecordDao;

	public List<UserStockRecord> queryAll(UUID userStockId) {
		List<UserStockRecord> entities = this.userStockRecordDao.findByUserStockId(userStockId);
		if (entities.size() == 0) {
			log.trace(MessageFormat.format(MessageConstant.QUERY_NO_DATA, DatabaseConstant.TABLE_USER_STOCK_RECORD));
		}
		if (entities.size() > AppConstant.FETCH_MAX_RECORD) {
			entities = entities.subList(0, AppConstant.FETCH_MAX_RECORD);
		}
		return entities;
	}

	public UserStockRecord query(UUID id) {
		Optional<UserStockRecord> optional = this.userStockRecordDao.findById(id);
		if (optional.isEmpty()) {
			log.trace(MessageFormat.format(MessageConstant.QUERY_NO_DATA, DatabaseConstant.TABLE_USER_STOCK_RECORD));
		}
		return optional.get();
	}

	public List<UserStockRecord> queryByAccountRecordId(UUID accountRecordId) {
		List<UserStockRecord> entities = this.userStockRecordDao.findByAccountRecordId(accountRecordId);
		if (entities.size() == 0) {
			log.trace(MessageFormat.format(MessageConstant.QUERY_NO_DATA, DatabaseConstant.TABLE_USER_STOCK_RECORD));
		}
		return entities;
	}

	public UserStockRecord insert(UserStockRecord entity) throws AlreadyExistException, FieldMissingException {
		if (!BaseAppUtil.isAllPresent(entity, entity.getUserStockId(), entity.getAccountId(), entity.getDate(), entity.getType(), entity.getPrice(), entity.getShare())) {
			throw new FieldMissingException();
		}
		return this.userStockRecordDao.save(entity);
	}

	public UserStockRecord update(UserStockRecord entity) throws NotExistException, FieldMissingException {
		if (!BaseAppUtil.isAllPresent(entity, entity.getId())) {
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
		if (!BaseAppUtil.isAllPresent(id)) {
			throw new NotExistException();
		}
		Optional<UserStockRecord> optional = this.userStockRecordDao.findById(id);
		if (optional.isEmpty()) {
			throw new NotExistException();
		}
		this.userStockRecordDao.delete(optional.get());
	}
}
