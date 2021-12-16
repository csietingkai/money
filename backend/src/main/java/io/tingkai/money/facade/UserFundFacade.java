package io.tingkai.money.facade;

import java.text.MessageFormat;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import io.tingkai.money.constant.DatabaseConstants;
import io.tingkai.money.constant.MessageConstant;
import io.tingkai.money.dao.UserFundDao;
import io.tingkai.money.entity.UserFund;
import io.tingkai.money.model.exception.AlreadyExistException;
import io.tingkai.money.model.exception.FieldMissingException;
import io.tingkai.money.model.exception.NotExistException;
import io.tingkai.money.util.AppUtil;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class UserFundFacade {

	@Autowired
	private UserFundDao userFundDao;

	public List<UserFund> queryAll() {
		List<UserFund> entities = this.userFundDao.findAll();
		if (entities.size() == 0) {
			log.trace(MessageFormat.format(MessageConstant.QUERY_NO_DATA, DatabaseConstants.TABLE_USER_FUND));
		}
		return entities;
	}

	public List<UserFund> queryByUsername(String username) {
		List<UserFund> entities = this.userFundDao.findByUserName(username);
		if (entities.size() == 0) {
			log.trace(MessageFormat.format(MessageConstant.QUERY_NO_DATA, DatabaseConstants.TABLE_USER_FUND));
		}
		return entities;
	}

	public UserFund query(UUID id) {
		Optional<UserFund> optional = this.userFundDao.findById(id);
		if (optional.isEmpty()) {
			log.trace(MessageFormat.format(MessageConstant.QUERY_NO_DATA, DatabaseConstants.TABLE_USER_FUND));
		}
		return optional.get();
	}

	public UserFund queryByUsernameAndFundCode(String username, String fundCode) {
		Optional<UserFund> optional = this.userFundDao.findByUserNameAndFundCode(username, fundCode);
		if (optional.isEmpty()) {
			log.trace(MessageFormat.format(MessageConstant.QUERY_NO_DATA, DatabaseConstants.TABLE_USER_FUND));
		}
		return optional.get();
	}

	public UserFund insert(UserFund entity) throws AlreadyExistException, FieldMissingException {
		if (!AppUtil.isAllPresent(entity, entity.getUserName(), entity.getFundCode(), entity.getAmount())) {
			throw new FieldMissingException();
		}
		Optional<UserFund> optional = this.userFundDao.findByUserNameAndFundCode(entity.getUserName(), entity.getFundCode());
		if (optional.isPresent()) {
			throw new AlreadyExistException();
		}
		return this.userFundDao.save(entity);
	}

	public UserFund update(UserFund entity) throws NotExistException, FieldMissingException {
		if (!AppUtil.isAllPresent(entity, entity.getId())) {
			throw new FieldMissingException();
		}
		Optional<UserFund> optional = this.userFundDao.findById(entity.getId());
		if (optional.isEmpty()) {
			throw new NotExistException();
		}
		UserFund updateEntity = optional.get();
		return this.userFundDao.save(updateEntity);
	}

	public void delete(UUID id) throws NotExistException {
		if (!AppUtil.isAllPresent(id)) {
			throw new NotExistException();
		}
		Optional<UserFund> optional = this.userFundDao.findById(id);
		if (optional.isEmpty()) {
			throw new NotExistException();
		}
		this.userFundDao.delete(optional.get());
	}
}
