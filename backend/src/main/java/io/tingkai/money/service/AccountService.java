package io.tingkai.money.service;

import java.math.BigDecimal;
import java.text.MessageFormat;
import java.util.List;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import io.tingkai.money.constant.MessageConstant;
import io.tingkai.money.entity.Account;
import io.tingkai.money.entity.AccountRecord;
import io.tingkai.money.facade.AccountFacade;
import io.tingkai.money.facade.AccountRecordFacade;
import io.tingkai.money.logging.Loggable;
import io.tingkai.money.model.exception.AccountBalanceWrongException;
import io.tingkai.money.model.exception.AlreadyExistException;
import io.tingkai.money.model.exception.FieldMissingException;
import io.tingkai.money.model.exception.NotExistException;

@Service
@Loggable
public class AccountService {

	@Autowired
	private AccountFacade accountFacade;

	@Autowired
	private AccountRecordFacade accountRecordFacade;

	public List<Account> getAll(String ownerName) {
		List<Account> entities = this.accountFacade.queryAll(ownerName);
		entities.sort((Account a, Account b) -> {
			return a.getName().compareToIgnoreCase(b.getName());
		});
		return entities;
	}

	public Account get(String name, String ownerName) {
		return this.accountFacade.query(name, ownerName);
	}

	public Account insert(Account entity) throws AlreadyExistException, FieldMissingException {
		if (entity.getBalance().compareTo(BigDecimal.ZERO) != 0) {
			return null;
		}
		return this.accountFacade.insert(entity);
	}

	public Account update(Account entity) throws NotExistException, FieldMissingException {
		return this.accountFacade.update(entity);
	}

	public void delete(UUID id) throws NotExistException {
		this.accountFacade.delete(id);
	}

	public List<AccountRecord> getAllRecords(UUID accountId, boolean latestFirstOrder) {
		List<AccountRecord> entities = this.accountRecordFacade.queryAll(accountId);
		if (latestFirstOrder) {
			entities.sort((AccountRecord a, AccountRecord b) -> {
				return b.getTransDate().compareTo(a.getTransDate());
			});
		}
		return entities;
	}

	public AccountRecord income(AccountRecord entity, UUID accountId) throws AccountBalanceWrongException, AlreadyExistException, NotExistException, FieldMissingException {
		Account account = this.accountFacade.query(accountId);
		entity.setTransAmount(entity.getTransAmount().abs());
		account.setBalance(account.getBalance().add(entity.getTransAmount()));
		entity.setTransFrom(accountId);
		entity.setTransTo(accountId);
		entity.setDescription(MessageFormat.format(MessageConstant.ACCOUNT_INCOME_DESC, account.getName(), entity.getDescription()));
		if (BigDecimal.ZERO.compareTo(entity.getTransAmount()) > 0) {
			throw new AccountBalanceWrongException(entity.getTransAmount());
		}
		this.accountFacade.update(account);
		return this.accountRecordFacade.insert(entity);
	}

	public AccountRecord expend(AccountRecord entity, UUID accountId) throws AccountBalanceWrongException, AlreadyExistException, NotExistException, FieldMissingException {
		Account account = this.accountFacade.query(accountId);
		entity.setTransAmount(BigDecimal.ZERO.subtract(entity.getTransAmount().abs()));
		account.setBalance(account.getBalance().add(entity.getTransAmount()));
		entity.setTransFrom(accountId);
		entity.setTransTo(accountId);
		entity.setDescription(MessageFormat.format(MessageConstant.ACCOUNT_EXPEND_DESC, account.getName(), entity.getDescription()));
		if (BigDecimal.ZERO.compareTo(entity.getTransAmount()) < 0) {
			throw new AccountBalanceWrongException(entity.getTransAmount());
		}
		this.accountFacade.update(account);
		return this.accountRecordFacade.insert(entity);
	}
}
