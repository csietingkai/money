package io.tingkai.money.facade;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import io.tingkai.money.constant.DatabaseConstants;
import io.tingkai.money.dao.UserTrackingStockDao;
import io.tingkai.money.entity.UserTrackingStock;
import io.tingkai.money.model.exception.AlreadyExistException;
import io.tingkai.money.model.exception.FieldMissingException;
import io.tingkai.money.model.exception.NotExistException;
import io.tingkai.money.model.exception.QueryNotResultException;
import io.tingkai.money.util.AppUtil;

@Service
public class UserTrackingStockFacade {

	@Autowired
	private UserTrackingStockDao userTrackingStockDao;

	public List<UserTrackingStock> queryAll() throws QueryNotResultException {
		List<UserTrackingStock> entities = this.userTrackingStockDao.findAll();
		if (entities.size() == 0) {
			throw new QueryNotResultException(DatabaseConstants.TABLE_USER_TRACKING_STOCK);
		}
		return entities;
	}

	public List<UserTrackingStock> queryAll(String username) throws QueryNotResultException {
		List<UserTrackingStock> entities = this.userTrackingStockDao.findByUserNameOrderByStockCode(username);
		if (entities.size() == 0) {
			throw new QueryNotResultException(DatabaseConstants.TABLE_USER_TRACKING_STOCK);
		}
		return entities;
	}

	public UserTrackingStock query(UUID id) throws QueryNotResultException {
		Optional<UserTrackingStock> optional = this.userTrackingStockDao.findById(id);
		if (optional.isEmpty()) {
			throw new QueryNotResultException(DatabaseConstants.TABLE_USER_TRACKING_STOCK);
		}
		return optional.get();
	}

	public UserTrackingStock query(String username, String stockCode) throws QueryNotResultException {
		Optional<UserTrackingStock> optional = this.userTrackingStockDao.findByUserNameAndStockCode(username, stockCode);
		if (optional.isEmpty()) {
			throw new QueryNotResultException(DatabaseConstants.TABLE_USER_TRACKING_STOCK);
		}
		return optional.get();
	}

	public UserTrackingStock insert(UserTrackingStock entity) throws AlreadyExistException, FieldMissingException {
		if (!AppUtil.isAllPresent(entity, entity.getUserName(), entity.getStockCode())) {
			throw new FieldMissingException();
		}
		return this.userTrackingStockDao.save(entity);
	}

	public UserTrackingStock update(UserTrackingStock entity) throws NotExistException, FieldMissingException {
		if (!AppUtil.isAllPresent(entity, entity.getId())) {
			throw new FieldMissingException();
		}
		Optional<UserTrackingStock> optional = this.userTrackingStockDao.findById(entity.getId());
		if (optional.isEmpty()) {
			throw new NotExistException();
		}
		UserTrackingStock updateEntity = optional.get();
		updateEntity.setUserName(entity.getUserName());
		updateEntity.setStockCode(entity.getStockCode());
		return this.userTrackingStockDao.save(updateEntity);
	}

	public void delete(UUID id) throws NotExistException {
		if (!AppUtil.isAllPresent(id)) {
			throw new NotExistException();
		}
		Optional<UserTrackingStock> optional = this.userTrackingStockDao.findById(id);
		if (optional.isEmpty()) {
			throw new NotExistException();
		}
		this.userTrackingStockDao.delete(optional.get());
	}
}
