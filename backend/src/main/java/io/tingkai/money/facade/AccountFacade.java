package io.tingkai.money.facade;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import io.tingkai.money.constant.DatabaseConstants;
import io.tingkai.money.dao.AccountDao;
import io.tingkai.money.entity.Account;
import io.tingkai.money.model.exception.AlreadyExistException;
import io.tingkai.money.model.exception.FieldMissingException;
import io.tingkai.money.model.exception.NotExistException;
import io.tingkai.money.model.exception.QueryNotResultException;
import io.tingkai.money.util.AppUtil;

@Service
public class AccountFacade {

	@Autowired
	private AccountDao accountDao;

	public List<Account> queryAll() throws QueryNotResultException {
		List<Account> entities = new ArrayList<Account>();
		Iterable<Account> iterable = this.accountDao.findAll();
		iterable.forEach(entities::add);
		if (entities.size() == 0) {
			throw new QueryNotResultException(DatabaseConstants.TABLE_ACCOUNT);
		}
		return entities;
	}

	public List<Account> queryAll(String ownerName) throws QueryNotResultException {
		List<Account> entities = new ArrayList<Account>();
		Iterable<Account> iterable = this.accountDao.findByOwnerName(ownerName);
		iterable.forEach(entities::add);
		if (entities.size() == 0) {
			throw new QueryNotResultException(DatabaseConstants.TABLE_ACCOUNT);
		}
		return entities;
	}

	public Account query(UUID id) throws QueryNotResultException {
		Optional<Account> optional = this.accountDao.findById(id);
		if (optional.isEmpty()) {
			throw new QueryNotResultException(DatabaseConstants.TABLE_ACCOUNT);
		}
		return optional.get();
	}

	public Account query(String name, String ownerName) throws QueryNotResultException {
		Optional<Account> optional = this.accountDao.findByNameAndOwnerName(name, ownerName);
		if (optional.isEmpty()) {
			throw new QueryNotResultException(DatabaseConstants.TABLE_ACCOUNT);
		}
		return optional.get();
	}

	public Account insert(Account entity) throws AlreadyExistException, FieldMissingException {
		if (!AppUtil.isAllPresent(entity, entity.getName(), entity.getOwnerName())) {
			throw new FieldMissingException();
		}
		Optional<Account> optional = this.accountDao.findByNameAndOwnerName(entity.getName(), entity.getOwnerName());
		if (optional.isPresent()) {
			throw new AlreadyExistException();
		}
		return this.accountDao.save(entity);
	}

	public Account update(Account entity) throws NotExistException, FieldMissingException {
		if (!AppUtil.isAllPresent(entity, entity.getId())) {
			throw new FieldMissingException();
		}
		Optional<Account> optional = this.accountDao.findById(entity.getId());
		if (optional.isEmpty()) {
			throw new NotExistException();
		}
		Account updateEntity = optional.get();
		updateEntity.setName(entity.getName());
		updateEntity.setOwnerName(entity.getOwnerName());
		updateEntity.setCurrency(entity.getCurrency());
		updateEntity.setBalance(entity.getBalance());
		return this.accountDao.save(updateEntity);
	}

	public void delete(UUID id) throws NotExistException {
		if (!AppUtil.isAllPresent(id)) {
			throw new NotExistException();
		}
		Optional<Account> optional = this.accountDao.findById(id);
		if (optional.isEmpty()) {
			throw new NotExistException();
		}
		this.accountDao.delete(optional.get());
	}
}
