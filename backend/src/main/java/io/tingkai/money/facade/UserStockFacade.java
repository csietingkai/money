package io.tingkai.money.facade;

import java.text.MessageFormat;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import io.tingkai.money.constant.DatabaseConstants;
import io.tingkai.money.constant.MessageConstant;
import io.tingkai.money.dao.UserStockDao;
import io.tingkai.money.entity.UserStock;
import io.tingkai.money.model.exception.AlreadyExistException;
import io.tingkai.money.model.exception.FieldMissingException;
import io.tingkai.money.model.exception.NotExistException;
import io.tingkai.money.util.AppUtil;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class UserStockFacade {

	@Autowired
	private UserStockDao userStockDao;

	public List<UserStock> queryAll() {
		List<UserStock> entities = this.userStockDao.findAll();
		if (entities.size() == 0) {
			log.trace(MessageFormat.format(MessageConstant.QUERY_NO_DATA, DatabaseConstants.TABLE_USER_STOCK));
		}
		return entities;
	}

	public List<UserStock> queryByUserId(UUID userId) {
		List<UserStock> entities = this.userStockDao.findByUserId(userId);
		if (entities.size() == 0) {
			log.trace(MessageFormat.format(MessageConstant.QUERY_NO_DATA, DatabaseConstants.TABLE_USER_STOCK));
		}
		return entities;
	}

	public UserStock query(UUID id) {
		Optional<UserStock> optional = this.userStockDao.findById(id);
		if (optional.isEmpty()) {
			log.trace(MessageFormat.format(MessageConstant.QUERY_NO_DATA, DatabaseConstants.TABLE_USER_STOCK));
		}
		return optional.get();
	}

	public UserStock queryByUserIdAndStockCode(UUID userId, String stockCode) {
		Optional<UserStock> optional = this.userStockDao.findByUserIdAndStockCode(userId, stockCode);
		if (optional.isEmpty()) {
			log.trace(MessageFormat.format(MessageConstant.QUERY_NO_DATA, DatabaseConstants.TABLE_USER_STOCK));
		}
		return optional.get();
	}

	public UserStock insert(UserStock entity) throws AlreadyExistException, FieldMissingException {
		if (!AppUtil.isAllPresent(entity, entity.getUserId(), entity.getStockCode(), entity.getAmount())) {
			throw new FieldMissingException();
		}
		Optional<UserStock> optional = this.userStockDao.findByUserIdAndStockCode(entity.getUserId(), entity.getStockCode());
		if (optional.isPresent()) {
			throw new AlreadyExistException();
		}
		return this.userStockDao.save(entity);
	}

	public UserStock update(UserStock entity) throws NotExistException, FieldMissingException {
		if (!AppUtil.isAllPresent(entity, entity.getId())) {
			throw new FieldMissingException();
		}
		Optional<UserStock> optional = this.userStockDao.findById(entity.getId());
		if (optional.isEmpty()) {
			throw new NotExistException();
		}
		UserStock updateEntity = optional.get();
		return this.userStockDao.save(updateEntity);
	}

	public void delete(UUID id) throws NotExistException {
		if (!AppUtil.isAllPresent(id)) {
			throw new NotExistException();
		}
		Optional<UserStock> optional = this.userStockDao.findById(id);
		if (optional.isEmpty()) {
			throw new NotExistException();
		}
		this.userStockDao.delete(optional.get());
	}
}
