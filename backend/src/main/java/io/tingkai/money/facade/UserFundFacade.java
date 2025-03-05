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
import io.tingkai.money.dao.UserFundDao;
import io.tingkai.money.entity.UserFund;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class UserFundFacade {

	@Autowired
	private UserFundDao userFundDao;

	public List<UserFund> queryByUserId(UUID userId) {
		List<UserFund> entities = this.userFundDao.findByUserId(userId);
		if (entities.size() == 0) {
			log.trace(MessageFormat.format(MessageConstant.QUERY_NO_DATA, DatabaseConstant.TABLE_USER_FUND));
		}
		return entities;
	}

	public UserFund query(UUID id) {
		Optional<UserFund> optional = this.userFundDao.findById(id);
		if (optional.isEmpty()) {
			log.trace(MessageFormat.format(MessageConstant.QUERY_NO_DATA, DatabaseConstant.TABLE_USER_FUND));
		}
		return optional.get();
	}

	public UserFund queryByUserIdAndFundCode(UUID userId, String fundCode) {
		Optional<UserFund> optional = this.userFundDao.findByUserIdAndFundCode(userId, fundCode);
		if (optional.isEmpty()) {
			log.trace(MessageFormat.format(MessageConstant.QUERY_NO_DATA, DatabaseConstant.TABLE_USER_FUND));
		}
		return optional.get();
	}

	public UserFund insert(UserFund entity) throws AlreadyExistException, FieldMissingException {
		if (!BaseAppUtil.isAllPresent(entity, entity.getUserId(), entity.getFundCode(), entity.getAmount())) {
			throw new FieldMissingException();
		}
		Optional<UserFund> optional = this.userFundDao.findByUserIdAndFundCode(entity.getUserId(), entity.getFundCode());
		if (optional.isPresent()) {
			throw new AlreadyExistException();
		}
		return this.userFundDao.save(entity);
	}

	public UserFund update(UserFund entity) throws NotExistException, FieldMissingException {
		if (!BaseAppUtil.isAllPresent(entity, entity.getId())) {
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
		if (!BaseAppUtil.isAllPresent(id)) {
			throw new NotExistException();
		}
		Optional<UserFund> optional = this.userFundDao.findById(id);
		if (optional.isEmpty()) {
			throw new NotExistException();
		}
		this.userFundDao.delete(optional.get());
	}
}
