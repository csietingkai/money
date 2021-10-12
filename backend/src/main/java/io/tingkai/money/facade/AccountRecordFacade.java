package io.tingkai.money.facade;

import java.text.MessageFormat;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import io.tingkai.money.constant.DatabaseConstants;
import io.tingkai.money.constant.MessageConstant;
import io.tingkai.money.dao.AccountRecordDao;
import io.tingkai.money.entity.AccountRecord;
import io.tingkai.money.model.exception.AlreadyExistException;
import io.tingkai.money.model.exception.NotExistException;
import io.tingkai.money.util.AppUtil;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class AccountRecordFacade {

	@Autowired
	private AccountRecordDao accountRecordDao;

	public List<AccountRecord> queryAll() {
		List<AccountRecord> entities = this.accountRecordDao.findAll();
		if (entities.size() == 0) {
			log.trace(MessageFormat.format(MessageConstant.QUERY_NO_DATA, DatabaseConstants.TABLE_ACCOUNT));
		}
		return entities;
	}

	public List<AccountRecord> queryAll(UUID accountId) {
		List<AccountRecord> entities = this.accountRecordDao.findByTransFromOrTransTo(accountId, accountId);
		if (entities.size() == 0) {
			log.trace(MessageFormat.format(MessageConstant.QUERY_NO_DATA, DatabaseConstants.TABLE_ACCOUNT));
		}
		return entities;
	}

	public AccountRecord query(UUID id) {
		Optional<AccountRecord> optional = this.accountRecordDao.findById(id);
		if (optional.isEmpty()) {
			log.trace(MessageFormat.format(MessageConstant.QUERY_NO_DATA, DatabaseConstants.TABLE_ACCOUNT));
		}
		return optional.get();
	}

	public AccountRecord insert(AccountRecord entity) throws AlreadyExistException {
		if (AppUtil.isAllPresent(entity, entity.getId())) {
			Optional<AccountRecord> optional = this.accountRecordDao.findById(entity.getId());
			if (optional.isPresent()) {
				throw new AlreadyExistException();
			}
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
