package io.tingkai.money.facade;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import io.tingkai.money.constant.DatabaseConstants;
import io.tingkai.money.dao.UserStockDao;
import io.tingkai.money.entity.UserStock;
import io.tingkai.money.model.exception.AlreadyExistException;
import io.tingkai.money.model.exception.FieldMissingException;
import io.tingkai.money.model.exception.NotExistException;
import io.tingkai.money.model.exception.QueryNotResultException;
import io.tingkai.money.util.AppUtil;

@Service
public class UserStockFacade {

	@Autowired
	private UserStockDao userStockDao;

	public List<UserStock> queryAll() throws QueryNotResultException {
		List<UserStock> entities = new ArrayList<UserStock>();
		Iterable<UserStock> iterable = this.userStockDao.findAll();
		iterable.forEach(entities::add);
		if (entities.size() == 0) {
			throw new QueryNotResultException(DatabaseConstants.TABLE_USER_STOCK);
		}
		return entities;
	}

	public List<UserStock> queryByUsername(String username) throws QueryNotResultException {
		List<UserStock> entities = new ArrayList<UserStock>();
		Iterable<UserStock> iterable = this.userStockDao.findByUserName(username);
		iterable.forEach(entities::add);
		if (entities.size() == 0) {
			throw new QueryNotResultException(DatabaseConstants.TABLE_USER_STOCK);
		}
		return entities;
	}

	public UserStock query(UUID id) throws QueryNotResultException {
		Optional<UserStock> optional = this.userStockDao.findById(id);
		if (optional.isEmpty()) {
			throw new QueryNotResultException(DatabaseConstants.TABLE_USER_STOCK);
		}
		return optional.get();
	}

	public UserStock queryByUsernameAndStockCode(String username, String stockCode) throws QueryNotResultException {
		Optional<UserStock> optional = this.userStockDao.findByUserNameAndStockCode(username, stockCode);
		if (optional.isEmpty()) {
			throw new QueryNotResultException(DatabaseConstants.TABLE_USER_STOCK);
		}
		return optional.get();
	}

	public UserStock insert(UserStock entity) throws AlreadyExistException, FieldMissingException {
		if (!AppUtil.isAllPresent(entity, entity.getUserName(), entity.getStockCode(), entity.getAmount())) {
			throw new FieldMissingException();
		}
		Optional<UserStock> optional = this.userStockDao.findByUserNameAndStockCode(entity.getUserName(), entity.getStockCode());
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
