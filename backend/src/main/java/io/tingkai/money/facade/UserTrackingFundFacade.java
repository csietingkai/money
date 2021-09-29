package io.tingkai.money.facade;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import io.tingkai.money.constant.DatabaseConstants;
import io.tingkai.money.dao.UserTrackingFundDao;
import io.tingkai.money.entity.UserTrackingFund;
import io.tingkai.money.model.exception.AlreadyExistException;
import io.tingkai.money.model.exception.FieldMissingException;
import io.tingkai.money.model.exception.NotExistException;
import io.tingkai.money.model.exception.QueryNotResultException;
import io.tingkai.money.util.AppUtil;

@Service
public class UserTrackingFundFacade {

	@Autowired
	private UserTrackingFundDao userTrackingFundDao;

	public List<UserTrackingFund> queryAll() throws QueryNotResultException {
		List<UserTrackingFund> entities = this.userTrackingFundDao.findAll();
		if (entities.size() == 0) {
			throw new QueryNotResultException(DatabaseConstants.TABLE_USER_TRACKING_FUND);
		}
		return entities;
	}

	public List<UserTrackingFund> queryAll(String username) throws QueryNotResultException {
		List<UserTrackingFund> entities = this.userTrackingFundDao.findByUserNameOrderByFundCode(username);
		if (entities.size() == 0) {
			throw new QueryNotResultException(DatabaseConstants.TABLE_USER_TRACKING_FUND);
		}
		return entities;
	}

	public UserTrackingFund query(UUID id) throws QueryNotResultException {
		Optional<UserTrackingFund> optional = this.userTrackingFundDao.findById(id);
		if (optional.isEmpty()) {
			throw new QueryNotResultException(DatabaseConstants.TABLE_USER_TRACKING_FUND);
		}
		return optional.get();
	}

	public UserTrackingFund query(String username, String code) throws QueryNotResultException {
		Optional<UserTrackingFund> optional = this.userTrackingFundDao.findByUserNameAndFundCode(username, code);
		if (optional.isEmpty()) {
			throw new QueryNotResultException(DatabaseConstants.TABLE_USER_TRACKING_FUND);
		}
		return optional.get();
	}

	public UserTrackingFund insert(UserTrackingFund entity) throws AlreadyExistException, FieldMissingException {
		if (!AppUtil.isAllPresent(entity, entity.getUserName(), entity.getFundCode())) {
			throw new FieldMissingException();
		}
		return this.userTrackingFundDao.save(entity);
	}

	public UserTrackingFund update(UserTrackingFund entity) throws NotExistException, FieldMissingException {
		if (!AppUtil.isAllPresent(entity, entity.getId())) {
			throw new FieldMissingException();
		}
		Optional<UserTrackingFund> optional = this.userTrackingFundDao.findById(entity.getId());
		if (optional.isEmpty()) {
			throw new NotExistException();
		}
		UserTrackingFund updateEntity = optional.get();
		updateEntity.setUserName(entity.getUserName());
		updateEntity.setFundCode(entity.getFundCode());
		return this.userTrackingFundDao.save(updateEntity);
	}

	public void delete(UUID id) throws NotExistException {
		if (!AppUtil.isAllPresent(id)) {
			throw new NotExistException();
		}
		Optional<UserTrackingFund> optional = this.userTrackingFundDao.findById(id);
		if (optional.isEmpty()) {
			throw new NotExistException();
		}
		this.userTrackingFundDao.delete(optional.get());
	}
}
