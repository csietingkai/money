package io.tingkai.money.service;

import java.math.BigDecimal;
import java.text.MessageFormat;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import io.tingkai.money.constant.CodeConstants;
import io.tingkai.money.entity.Account;
import io.tingkai.money.entity.AccountRecord;
import io.tingkai.money.facade.AccountFacade;
import io.tingkai.money.facade.AccountRecordFacade;
import io.tingkai.money.facade.UserFundRecordFacade;
import io.tingkai.money.facade.UserStockRecordFacade;
import io.tingkai.money.logging.Loggable;
import io.tingkai.money.model.exception.AccountBalanceNotEnoughException;
import io.tingkai.money.model.exception.AccountBalanceWrongException;
import io.tingkai.money.model.exception.AlreadyExistException;
import io.tingkai.money.model.exception.FieldMissingException;
import io.tingkai.money.model.exception.NotExistException;
import io.tingkai.money.model.vo.AccountRecordVo;
import io.tingkai.money.model.vo.BalancePairVo;
import io.tingkai.money.model.vo.MonthBalanceVo;
import io.tingkai.money.util.AppUtil;
import io.tingkai.money.util.ContextUtil;

@Service
@Loggable
public class AccountService {

	@Autowired
	private AccountFacade accountFacade;

	@Autowired
	private AccountRecordFacade accountRecordFacade;

	@Autowired
	private UserStockRecordFacade userStockRecordFacade;

	@Autowired
	private UserFundRecordFacade userFundRecordFacade;

	@Autowired
	@Qualifier(CodeConstants.USER_CACHE)
	private RedisTemplate<String, List<Account>> userCache;

	public List<Account> getAll(UUID userId) {
		List<Account> entities = this.syncCache(userId);
		return entities;
	}

	public Account get(String name, UUID userId) {
		return this.accountFacade.query(name, userId);
	}

	@Transactional
	public Account insert(String name, String currency) throws AlreadyExistException, FieldMissingException {
		Account entity = new Account();
		entity.setName(name);
		entity.setUserId(ContextUtil.getUserId());
		entity.setCurrency(currency);
		entity.setBalance(BigDecimal.ZERO);
		return this.accountFacade.insert(entity);
	}

	@Transactional
	public Account update(UUID id, String name) throws NotExistException, FieldMissingException {
		Account entity = this.accountFacade.query(id);
		entity.setName(name);
		return this.accountFacade.update(entity);
	}

	public MonthBalanceVo getAllRecordInMonth(UUID userId, int year, int month) {
		MonthBalanceVo vo = new MonthBalanceVo();
		vo.setYear(year);
		vo.setMonth(month);

		List<Account> accounts = this.userCache.opsForValue().get(MessageFormat.format(CodeConstants.ACCOUNT_LIST, userId));
		if (AppUtil.isEmpty(accounts)) {
			accounts = this.accountFacade.queryAll(userId);
			this.userCache.opsForValue().set(CodeConstants.ACCOUNT_LIST, accounts);
		}
		List<UUID> accountIds = accounts.stream().map(Account::getId).collect(Collectors.toList());
		Map<UUID, String> accountCurrency = accounts.stream().collect(Collectors.toMap(Account::getId, Account::getCurrency));
		List<AccountRecord> records = this.accountRecordFacade.queryAllInMonth(accountIds, year, month);
		// @formatter:off
		records = records.stream()
				.filter(x -> x.getTransFrom().compareTo(x.getTransTo()) == 0)
				.collect(Collectors.toList());
		Map<String, List<AccountRecord>> incomes = records.stream()
				.filter(x -> BigDecimal.ZERO.compareTo(x.getTransAmount()) < 0)
				.collect(
						() -> new HashMap<String, List<AccountRecord>>(),
						(map, record) -> {
							String currency = accountCurrency.get(record.getTransFrom());
							if (!map.containsKey(currency)) {
								map.put(currency, new ArrayList<AccountRecord>());
							}
							map.get(currency).add(record);
						},
						(map1, map2) -> map1.putAll(map2)
				);
		Map<String, List<AccountRecord>> expends = records.stream()
				.filter(x -> BigDecimal.ZERO.compareTo(x.getTransAmount()) > 0)
				.collect(
						() -> new HashMap<String, List<AccountRecord>>(),
						(map, record) -> {
							String currency = accountCurrency.get(record.getTransFrom());
							if (!map.containsKey(currency)) {
								map.put(currency, new ArrayList<AccountRecord>());
							}
							map.get(currency).add(record);
						},
						(map1, map2) -> map1.putAll(map2)
				);
		// @formatter:on

		incomes.forEach((currency, incomeRecords) -> {
			BalancePairVo pair = new BalancePairVo();
			pair.setCurrency(currency);
			BigDecimal sum = incomeRecords.stream().map(AccountRecord::getTransAmount).reduce(BigDecimal.ZERO, BigDecimal::add);
			pair.setAmount(sum);
			vo.getIncome().add(pair);
		});
		expends.forEach((currency, expendRecords) -> {
			BalancePairVo pair = new BalancePairVo();
			pair.setCurrency(currency);
			BigDecimal sum = expendRecords.stream().map(AccountRecord::getTransAmount).reduce(BigDecimal.ZERO, BigDecimal::add);
			pair.setAmount(sum);
			vo.getExpend().add(pair);
		});

		return vo;
	}

	public List<AccountRecordVo> getAllRecords(UUID accountId, boolean latestFirstOrder) {
		List<AccountRecord> entities = this.accountRecordFacade.queryAll(accountId, latestFirstOrder);

		Account account = this.accountFacade.query(accountId);
		List<Account> accounts = this.userCache.opsForValue().get(MessageFormat.format(CodeConstants.ACCOUNT_LIST, account.getUserId()));
		Map<UUID, Account> accountMap = accounts.stream().collect(Collectors.toMap(Account::getId, acc -> acc));

		List<AccountRecordVo> vos = new ArrayList<AccountRecordVo>();
		for (AccountRecord record : entities) {
			AccountRecordVo vo = new AccountRecordVo();
			vo.transform(record);
			vo.setTransFromName(accountMap.get(record.getTransFrom()).getName());
			vo.setTransFromCurrency(accountMap.get(record.getTransFrom()).getCurrency());
			vo.setTransToName(accountMap.get(record.getTransTo()).getName());
			vo.setTransToCurrency(accountMap.get(record.getTransTo()).getCurrency());
			if (!vo.getTransFrom().equals(vo.getTransTo()) && accountId.equals(vo.getTransFrom())) {
				vo.setTransAmount(BigDecimal.ZERO.subtract(vo.getTransAmount()));
			}
			vo.setRemovable(!isLinked(vo.getId()));
			vos.add(vo);
		}
		return vos;
	}

	@Transactional
	public AccountRecord income(UUID accountId, LocalDateTime date, BigDecimal amount, String type, String description, UUID fileId) throws AccountBalanceWrongException, AlreadyExistException, NotExistException, FieldMissingException {
		Account account = this.accountFacade.query(accountId);
		AccountRecord record = new AccountRecord();
		record.setTransDate(date);
		record.setTransAmount(amount);
		record.setTransFrom(accountId);
		record.setTransTo(accountId);
		record.setRecordType(type);
		record.setDescription(description);
		record.setFileId(fileId);
		if (BigDecimal.ZERO.compareTo(record.getTransAmount()) > 0) {
			throw new AccountBalanceWrongException(record.getTransAmount());
		}
		account.setBalance(account.getBalance().add(record.getTransAmount()));
		this.accountFacade.update(account);
		return this.accountRecordFacade.insert(record);
	}

	@Transactional
	public AccountRecord transfer(UUID fromId, UUID toId, LocalDateTime date, BigDecimal amount, String type, String description, UUID fileId) throws AccountBalanceNotEnoughException, AccountBalanceWrongException, NotExistException, FieldMissingException {
		Account from = this.accountFacade.query(fromId);
		Account to = this.accountFacade.query(toId);
		if (from.getBalance().compareTo(amount) < 0) {
			throw new AccountBalanceNotEnoughException(from.getName());
		}
		if (BigDecimal.ZERO.compareTo(amount) >= 0) {
			throw new AccountBalanceWrongException(amount);
		}
		AccountRecord record = new AccountRecord();
		record.setTransDate(date);
		record.setTransAmount(amount);
		record.setTransFrom(fromId);
		record.setTransTo(toId);
		record.setRecordType(type);
		record.setDescription(description);
		record.setFileId(fileId);
		from.setBalance(from.getBalance().subtract(amount));
		to.setBalance(to.getBalance().add(amount));
		this.accountFacade.update(from);
		this.accountFacade.update(to);
		return this.accountRecordFacade.insert(record);
	}

	@Transactional
	public AccountRecord expend(UUID accountId, LocalDateTime date, BigDecimal amount, String type, String description, UUID fileId) throws AccountBalanceWrongException, AlreadyExistException, NotExistException, FieldMissingException {
		Account account = this.accountFacade.query(accountId);
		AccountRecord record = new AccountRecord();
		record.setTransDate(date);
		record.setTransAmount(amount);
		record.setTransFrom(accountId);
		record.setTransTo(accountId);
		record.setRecordType(type);
		record.setDescription(description);
		record.setFileId(fileId);
		if (BigDecimal.ZERO.compareTo(record.getTransAmount()) < 0) {
			throw new AccountBalanceWrongException(record.getTransAmount());
		}
		account.setBalance(account.getBalance().add(record.getTransAmount()));
		this.accountFacade.update(account);
		return this.accountRecordFacade.insert(record);
	}

	@Transactional
	public void reverseRecord(UUID recordId) throws NotExistException, FieldMissingException {
		AccountRecord record = this.accountRecordFacade.query(recordId);
		UUID from = record.getTransFrom();
		UUID to = record.getTransTo();
		boolean isTransfer = from.compareTo(to) != 0;
		if (!isTransfer) {
			Account account = this.accountFacade.query(from);
			account.setBalance(account.getBalance().subtract(record.getTransAmount()));
			this.accountFacade.update(account);
			this.accountRecordFacade.delete(recordId);
		} else {
			Account fromAcc = this.accountFacade.query(from);
			Account toAcc = this.accountFacade.query(to);
			fromAcc.setBalance(fromAcc.getBalance().add(record.getTransAmount()));
			toAcc.setBalance(toAcc.getBalance().subtract(record.getTransAmount()));
			this.accountFacade.update(fromAcc);
			this.accountFacade.update(toAcc);
			this.accountRecordFacade.delete(recordId);
		}
	}

	private List<Account> syncCache(UUID userId) {
		List<Account> entities = this.accountFacade.queryAll(userId);
		entities.sort((Account a, Account b) -> {
			return a.getName().compareToIgnoreCase(b.getName());
		});
		this.userCache.opsForValue().set(MessageFormat.format(CodeConstants.ACCOUNT_LIST, userId), entities);
		return entities;
	}

	private boolean isLinked(UUID recordId) {
		return this.userStockRecordFacade.queryByAccountRecordId(recordId).size() > 0 || this.userFundRecordFacade.queryByAccountRecordId(recordId).size() > 0;
	}
}
