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
import io.tingkai.money.constant.DatabaseConstant;
import io.tingkai.money.constant.MessageConstant;
import io.tingkai.money.dao.UserTrackingFundDao;
import io.tingkai.money.entity.UserTrackingFund;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class UserTrackingFundFacade {

	@Autowired
	private UserTrackingFundDao userTrackingFundDao;

	public List<UserTrackingFund> queryAll() {
		List<UserTrackingFund> entities = this.userTrackingFundDao.findAll();
		if (entities.size() == 0) {
			log.trace(MessageFormat.format(MessageConstant.QUERY_NO_DATA, DatabaseConstant.TABLE_USER_TRACKING_FUND));
		}
		return entities;
	}

	public List<UserTrackingFund> queryAll(UUID userId) {
		List<UserTrackingFund> entities = this.userTrackingFundDao.findByUserIdOrderByFundCode(userId);
		if (entities.size() == 0) {
			log.trace(MessageFormat.format(MessageConstant.QUERY_NO_DATA, DatabaseConstant.TABLE_USER_TRACKING_FUND));
		}
		return entities;
	}

	public UserTrackingFund query(UUID id) {
		Optional<UserTrackingFund> optional = this.userTrackingFundDao.findById(id);
		if (optional.isEmpty()) {
			log.trace(MessageFormat.format(MessageConstant.QUERY_NO_DATA, DatabaseConstant.TABLE_USER_TRACKING_FUND));
		}
		return optional.get();
	}

	public UserTrackingFund query(UUID userId, String code) {
		Optional<UserTrackingFund> optional = this.userTrackingFundDao.findByUserIdAndFundCode(userId, code);
		if (optional.isEmpty()) {
			log.trace(MessageFormat.format(MessageConstant.QUERY_NO_DATA, DatabaseConstant.TABLE_USER_TRACKING_FUND));
		}
		return optional.get();
	}

	public UserTrackingFund insert(UserTrackingFund entity) throws AlreadyExistException, FieldMissingException {
		if (!BaseAppUtil.isAllPresent(entity, entity.getUserId(), entity.getFundCode())) {
			throw new FieldMissingException();
		}
		return this.userTrackingFundDao.save(entity);
	}

	public UserTrackingFund update(UserTrackingFund entity) throws NotExistException, FieldMissingException {
		if (!BaseAppUtil.isAllPresent(entity, entity.getId())) {
			throw new FieldMissingException();
		}
		Optional<UserTrackingFund> optional = this.userTrackingFundDao.findById(entity.getId());
		if (optional.isEmpty()) {
			throw new NotExistException();
		}
		UserTrackingFund updateEntity = optional.get();
		updateEntity.setUserId(entity.getUserId());
		updateEntity.setFundCode(entity.getFundCode());
		return this.userTrackingFundDao.save(updateEntity);
	}

	public void delete(UUID id) throws NotExistException {
		if (!BaseAppUtil.isAllPresent(id)) {
			throw new NotExistException();
		}
		Optional<UserTrackingFund> optional = this.userTrackingFundDao.findById(id);
		if (optional.isEmpty()) {
			throw new NotExistException();
		}
		this.userTrackingFundDao.delete(optional.get());
	}
}
