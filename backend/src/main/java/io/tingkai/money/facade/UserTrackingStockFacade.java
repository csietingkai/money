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
import io.tingkai.money.dao.UserTrackingStockDao;
import io.tingkai.money.entity.UserTrackingStock;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class UserTrackingStockFacade {

	@Autowired
	private UserTrackingStockDao userTrackingStockDao;

	public List<UserTrackingStock> queryAll() {
		List<UserTrackingStock> entities = this.userTrackingStockDao.findAll();
		if (entities.size() == 0) {
			log.trace(MessageFormat.format(MessageConstant.QUERY_NO_DATA, DatabaseConstant.TABLE_USER_TRACKING_STOCK));
		}
		return entities;
	}

	public List<UserTrackingStock> queryAll(UUID userId) {
		List<UserTrackingStock> entities = this.userTrackingStockDao.findByUserIdOrderByStockCode(userId);
		if (entities.size() == 0) {
			log.trace(MessageFormat.format(MessageConstant.QUERY_NO_DATA, DatabaseConstant.TABLE_USER_TRACKING_STOCK));
		}
		return entities;
	}

	public UserTrackingStock query(UUID id) {
		Optional<UserTrackingStock> optional = this.userTrackingStockDao.findById(id);
		if (optional.isEmpty()) {
			log.trace(MessageFormat.format(MessageConstant.QUERY_NO_DATA, DatabaseConstant.TABLE_USER_TRACKING_STOCK));
		}
		return optional.get();
	}

	public UserTrackingStock query(UUID userId, String stockCode) {
		Optional<UserTrackingStock> optional = this.userTrackingStockDao.findByUserIdAndStockCode(userId, stockCode);
		if (optional.isEmpty()) {
			log.trace(MessageFormat.format(MessageConstant.QUERY_NO_DATA, DatabaseConstant.TABLE_USER_TRACKING_STOCK));
		}
		return optional.get();
	}

	public UserTrackingStock insert(UserTrackingStock entity) throws AlreadyExistException, FieldMissingException {
		if (!BaseAppUtil.isAllPresent(entity, entity.getUserId(), entity.getStockCode())) {
			throw new FieldMissingException();
		}
		return this.userTrackingStockDao.save(entity);
	}

	public UserTrackingStock update(UserTrackingStock entity) throws NotExistException, FieldMissingException {
		if (!BaseAppUtil.isAllPresent(entity, entity.getId())) {
			throw new FieldMissingException();
		}
		Optional<UserTrackingStock> optional = this.userTrackingStockDao.findById(entity.getId());
		if (optional.isEmpty()) {
			throw new NotExistException();
		}
		UserTrackingStock updateEntity = optional.get();
		updateEntity.setUserId(entity.getUserId());
		updateEntity.setStockCode(entity.getStockCode());
		return this.userTrackingStockDao.save(updateEntity);
	}

	public void delete(UUID id) throws NotExistException {
		if (!BaseAppUtil.isAllPresent(id)) {
			throw new NotExistException();
		}
		Optional<UserTrackingStock> optional = this.userTrackingStockDao.findById(id);
		if (optional.isEmpty()) {
			throw new NotExistException();
		}
		this.userTrackingStockDao.delete(optional.get());
	}
}
