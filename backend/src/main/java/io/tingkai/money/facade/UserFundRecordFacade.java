package io.tingkai.money.facade;

import java.text.MessageFormat;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import io.tingkai.money.constant.DatabaseConstants;
import io.tingkai.money.constant.MessageConstant;
import io.tingkai.money.dao.UserFundRecordDao;
import io.tingkai.money.entity.UserFundRecord;
import io.tingkai.money.model.exception.AlreadyExistException;
import io.tingkai.money.model.exception.FieldMissingException;
import io.tingkai.money.model.exception.NotExistException;
import io.tingkai.money.util.AppUtil;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class UserFundRecordFacade {

	@Autowired
	private UserFundRecordDao userFundRecordDao;

	public List<UserFundRecord> queryAll() {
		List<UserFundRecord> entities = this.userFundRecordDao.findAll();
		if (entities.size() == 0) {
			log.trace(MessageFormat.format(MessageConstant.QUERY_NO_DATA, DatabaseConstants.TABLE_USER_FUND_RECORD));
		}
		return entities;
	}

	public List<UserFundRecord> queryAll(List<UUID> userFundIds) {
		List<UserFundRecord> entities = this.userFundRecordDao.findByUserFundIdIn(userFundIds);
		if (entities.size() == 0) {
			log.trace(MessageFormat.format(MessageConstant.QUERY_NO_DATA, DatabaseConstants.TABLE_USER_FUND_RECORD));
		}
		return entities;
	}

	public List<UserFundRecord> queryByAccountId(UUID accountId) {
		List<UserFundRecord> entities = this.userFundRecordDao.findByAccountId(accountId);
		if (entities.size() == 0) {
			log.trace(MessageFormat.format(MessageConstant.QUERY_NO_DATA, DatabaseConstants.TABLE_USER_FUND_RECORD));
		}
		return entities;
	}

	public UserFundRecord query(UUID id) {
		Optional<UserFundRecord> optional = this.userFundRecordDao.findById(id);
		if (optional.isEmpty()) {
			log.trace(MessageFormat.format(MessageConstant.QUERY_NO_DATA, DatabaseConstants.TABLE_USER_FUND_RECORD));
		}
		return optional.get();
	}

	public UserFundRecord insert(UserFundRecord entity) throws AlreadyExistException, FieldMissingException {
		if (!AppUtil.isAllPresent(entity, entity.getUserFundId(), entity.getAccountId(), entity.getDate(), entity.getType(), entity.getPrice(), entity.getShare())) {
			throw new FieldMissingException();
		}
		return this.userFundRecordDao.save(entity);
	}

	public UserFundRecord update(UserFundRecord entity) throws NotExistException, FieldMissingException {
		if (!AppUtil.isAllPresent(entity, entity.getId())) {
			throw new FieldMissingException();
		}
		Optional<UserFundRecord> optional = this.userFundRecordDao.findById(entity.getId());
		if (optional.isEmpty()) {
			throw new NotExistException();
		}
		UserFundRecord updateEntity = optional.get();
		updateEntity.setUserFundId(entity.getUserFundId());
		updateEntity.setAccountId(entity.getAccountId());
		updateEntity.setType(entity.getType());
		updateEntity.setDate(entity.getDate());
		updateEntity.setShare(entity.getShare());
		updateEntity.setPrice(entity.getPrice());
		updateEntity.setFee(entity.getFee());
		return this.userFundRecordDao.save(updateEntity);
	}

	public void delete(UUID id) throws NotExistException {
		if (!AppUtil.isAllPresent(id)) {
			throw new NotExistException();
		}
		Optional<UserFundRecord> optional = this.userFundRecordDao.findById(id);
		if (optional.isEmpty()) {
			throw new NotExistException();
		}
		this.userFundRecordDao.delete(optional.get());
	}
}
