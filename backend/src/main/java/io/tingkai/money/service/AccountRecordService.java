package io.tingkai.money.service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import io.tingkai.money.constant.DatabaseConstants;
import io.tingkai.money.dao.AccountRecordDao;
import io.tingkai.money.entity.AccountRecord;
import io.tingkai.money.model.exception.AlreadyExistException;
import io.tingkai.money.model.exception.NotExistException;
import io.tingkai.money.model.exception.QueryNotResultException;
import io.tingkai.money.util.AppUtil;

/**
 * provide method for get single or multiple data from database table
 * 'account_record'
 * 
 * @author tingkai
 */
@Service
public class AccountRecordService {

	@Autowired
	private AccountRecordDao accountRecordDao;

	public List<AccountRecord> getAll(UUID accountId) throws QueryNotResultException {
		List<AccountRecord> entities = new ArrayList<AccountRecord>();
		Iterable<AccountRecord> iterable = this.accountRecordDao.findByTransFromOrTransTo(accountId, accountId);
		iterable.forEach(entities::add);
		if (entities.size() == 0) {
			throw new QueryNotResultException(DatabaseConstants.TABLE_ACCOUNT_RECORD);
		}
		return entities;
	}

	public AccountRecord get(UUID id) throws QueryNotResultException {
		Optional<AccountRecord> optional = this.accountRecordDao.findById(id);
		if (optional.isEmpty()) {
			throw new QueryNotResultException(DatabaseConstants.TABLE_ACCOUNT_RECORD);
		}
		return optional.get();
	}

	public AccountRecord insert(AccountRecord entity) throws AlreadyExistException {
		Optional<AccountRecord> optional = this.accountRecordDao.findById(entity.getId());
		if (optional.isPresent()) {
			throw new AlreadyExistException();
		}
		return this.accountRecordDao.save(entity);
	}

	public AccountRecord update(AccountRecord entity) throws NotExistException {
		Optional<AccountRecord> optional = this.accountRecordDao.findById(entity.getId());
		if (optional.isEmpty()) {
			throw new NotExistException();
		}
		AccountRecord updateEntity = optional.get();
		updateEntity.setTransDate(entity.getTransDate());
		updateEntity.setTransAmount(entity.getTransAmount());
		updateEntity.setTransFrom(entity.getTransFrom());
		updateEntity.setTransTo(entity.getTransTo());
		updateEntity.setDescription(entity.getDescription());
		return this.accountRecordDao.save(updateEntity);
	}

	public void delete(UUID id) throws NotExistException {
		if (!AppUtil.isAllPresent(id)) {
			throw new NotExistException();
		}
		Optional<AccountRecord> optional = this.accountRecordDao.findById(id);
		if (optional.isEmpty()) {
			throw new NotExistException();
		}
		this.accountRecordDao.delete(optional.get());
	}
}
