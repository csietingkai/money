package io.tingkai.money.facade;

import java.math.BigDecimal;
import java.text.MessageFormat;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import io.tingkai.money.constant.DatabaseConstants;
import io.tingkai.money.constant.MessageConstant;
import io.tingkai.money.dao.AccountDao;
import io.tingkai.money.entity.Account;
import io.tingkai.money.model.exception.AlreadyExistException;
import io.tingkai.money.model.exception.FieldMissingException;
import io.tingkai.money.model.exception.NotExistException;
import io.tingkai.money.util.AppUtil;
import io.tingkai.money.util.StringUtil;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class AccountFacade {

	@Autowired
	private AccountDao accountDao;

	public List<Account> queryAll(UUID userId) {
		List<Account> entities = this.accountDao.findByUserId(userId);
		if (entities.size() == 0) {
			log.trace(MessageFormat.format(MessageConstant.QUERY_NO_DATA, DatabaseConstants.TABLE_ACCOUNT));
		}
		return entities;
	}

	public Account query(UUID id) {
		Optional<Account> optional = this.accountDao.findById(id);
		if (optional.isEmpty()) {
			log.trace(MessageFormat.format(MessageConstant.QUERY_NO_DATA, DatabaseConstants.TABLE_ACCOUNT));
		}
		return optional.get();
	}

	public Account query(String name, UUID userId) {
		Optional<Account> optional = this.accountDao.findByNameAndUserId(name, userId);
		if (optional.isEmpty()) {
			log.trace(MessageFormat.format(MessageConstant.QUERY_NO_DATA, DatabaseConstants.TABLE_ACCOUNT));
		}
		return optional.get();
	}

	public Account insert(Account entity) throws AlreadyExistException, FieldMissingException {
		if (!AppUtil.isAllPresent(entity, entity.getUserId(), entity.getName(), entity.getCurrency())) {
			throw new FieldMissingException();
		}
		if (!AppUtil.isAllPresent(entity.getBalance())) {
			entity.setBalance(BigDecimal.ZERO);
		}
		Optional<Account> optional = this.accountDao.findByNameAndUserId(entity.getName(), entity.getUserId());
		if (optional.isPresent()) {
			throw new AlreadyExistException();
		}

		if (StringUtil.isBlank(entity.getBankCode())) {
			entity.setBankCode(null);
		}
		if (StringUtil.isBlank(entity.getBankNo())) {
			entity.setBankNo(null);
		}

		return this.accountDao.save(entity);
	}

	public Account update(Account entity) throws NotExistException, FieldMissingException {
		if (!AppUtil.isAllPresent(entity, entity.getId(), entity.getUserId(), entity.getName(), entity.getCurrency())) {
			throw new FieldMissingException();
		}
		Optional<Account> optional = this.accountDao.findById(entity.getId());
		if (optional.isEmpty()) {
			throw new NotExistException();
		}
		Account updateEntity = optional.get();
		updateEntity.setName(entity.getName());
		if (StringUtil.isBlank(entity.getBankCode())) {
			entity.setBankCode(null);
		}
		if (StringUtil.isBlank(entity.getBankNo())) {
			entity.setBankNo(null);
		}
		return this.accountDao.save(updateEntity);
	}

	public void remove(UUID id) {
		this.accountDao.deleteById(id);
	}
}
