package io.tingkai.money.facade;

import java.text.MessageFormat;
import java.util.Optional;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import io.tingkai.money.constant.DatabaseConstants;
import io.tingkai.money.constant.MessageConstant;
import io.tingkai.money.dao.UserSettingDao;
import io.tingkai.money.entity.UserSetting;
import io.tingkai.money.model.exception.AlreadyExistException;
import io.tingkai.money.model.exception.FieldMissingException;
import io.tingkai.money.model.exception.NotExistException;
import io.tingkai.money.util.AppUtil;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class UserSettingFacade {

	@Autowired
	private UserSettingDao userSettingDao;

	public UserSetting query(UUID id) {
		Optional<UserSetting> optional = this.userSettingDao.findById(id);
		if (optional.isEmpty()) {
			log.trace(MessageFormat.format(MessageConstant.QUERY_NO_DATA, DatabaseConstants.TABLE_USER_SETTING));
		}
		return optional.get();
	}

	public UserSetting queryByUserId(UUID userId) {
		Optional<UserSetting> optional = this.userSettingDao.findByUserId(userId);
		if (optional.isEmpty()) {
			log.trace(MessageFormat.format(MessageConstant.QUERY_NO_DATA, DatabaseConstants.TABLE_USER_SETTING));
		}
		return optional.get();
	}

	public UserSetting insert(UserSetting entity) throws AlreadyExistException, FieldMissingException {
		if (!AppUtil.isAllPresent(entity, entity.getAccountRecordDeletable(), entity.getAccountRecordType(), entity.getPredictDays(), entity.getStockType(), entity.getUserId())) {
			throw new FieldMissingException();
		}
		Optional<UserSetting> optional = this.userSettingDao.findByUserId(entity.getUserId());
		if (optional.isPresent()) {
			throw new AlreadyExistException();
		}
		return this.userSettingDao.save(entity);
	}

	public UserSetting update(UserSetting entity) throws FieldMissingException, NotExistException {
		if (!AppUtil.isAllPresent(entity, entity.getId(), entity.getAccountRecordDeletable(), entity.getAccountRecordType(), entity.getPredictDays(), entity.getStockType(), entity.getUserId(), entity.getStockFeeRate(), entity.getFundFeeRate())) {
			throw new FieldMissingException();
		}
		Optional<UserSetting> optional = this.userSettingDao.findById(entity.getId());
		if (!optional.isPresent()) {
			throw new NotExistException();
		}
		return this.userSettingDao.save(entity);
	}
}
