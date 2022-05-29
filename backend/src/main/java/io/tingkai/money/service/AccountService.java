package io.tingkai.money.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.text.MessageFormat;
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

import io.tingkai.money.constant.CodeConstants;
import io.tingkai.money.constant.MessageConstant;
import io.tingkai.money.entity.Account;
import io.tingkai.money.entity.AccountRecord;
import io.tingkai.money.entity.ExchangeRateRecord;
import io.tingkai.money.facade.AccountFacade;
import io.tingkai.money.facade.AccountRecordFacade;
import io.tingkai.money.facade.ExchangeRateRecordFacade;
import io.tingkai.money.logging.Loggable;
import io.tingkai.money.model.exception.AccountBalanceWrongException;
import io.tingkai.money.model.exception.AlreadyExistException;
import io.tingkai.money.model.exception.FieldMissingException;
import io.tingkai.money.model.exception.NotExistException;
import io.tingkai.money.model.vo.AccountRecordVo;
import io.tingkai.money.model.vo.BalancePairVo;
import io.tingkai.money.model.vo.MonthBalanceVo;
import io.tingkai.money.util.AppUtil;

@Service
@Loggable
public class AccountService {

	@Autowired
	private ExchangeRateRecordFacade exchangeRateRecordFacade;

	@Autowired
	private AccountFacade accountFacade;

	@Autowired
	private AccountRecordFacade accountRecordFacade;

	@Autowired
	@Qualifier(CodeConstants.USER_CACHE)
	private RedisTemplate<String, List<Account>> userCache;

	public List<Account> getAll(String ownerName) {
		List<Account> entities = this.syncCache(ownerName);
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
		List<AccountRecord> records = this.accountRecordFacade.queryAll(id);
		for (AccountRecord record : records) {
			this.accountRecordFacade.delete(record.getId());
		}
		this.accountFacade.delete(id);
	}

	public MonthBalanceVo getAllRecordInMonth(String ownerName, int year, int month) {
		MonthBalanceVo vo = new MonthBalanceVo();
		vo.setYear(year);
		vo.setMonth(month);

		List<Account> accounts = this.userCache.opsForValue().get(MessageFormat.format(CodeConstants.ACCOUNT_LIST, ownerName));
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
		List<AccountRecord> entities = this.accountRecordFacade.queryAll(accountId);
		if (latestFirstOrder) {
			entities.sort((AccountRecord a, AccountRecord b) -> {
				return b.getTransDate().compareTo(a.getTransDate());
			});
		}

		Account account = this.accountFacade.query(accountId);
		List<Account> accounts = this.userCache.opsForValue().get(MessageFormat.format(CodeConstants.ACCOUNT_LIST, account.getOwnerName()));
		Map<UUID, Account> accountMap = accounts.stream().collect(Collectors.toMap(Account::getId, acc -> acc));

		List<AccountRecordVo> vos = new ArrayList<AccountRecordVo>();
		for (AccountRecord record : entities) {
			AccountRecordVo vo = new AccountRecordVo();
			vo.transform(record);
			vo.setTransFromName(accountMap.get(record.getTransFrom()).getName());
			vo.setTransFromCurrency(accountMap.get(record.getTransFrom()).getCurrency());
			vo.setTransToName(accountMap.get(record.getTransTo()).getName());
			vo.setTransToCurrency(accountMap.get(record.getTransTo()).getCurrency());
			vos.add(vo);
		}
		return vos;
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

	public AccountRecord transfer(AccountRecord entity, UUID accountId) throws AccountBalanceWrongException, AlreadyExistException, NotExistException, FieldMissingException {
		Account account = this.accountFacade.query(accountId);
		Account transferTo = this.accountFacade.query(entity.getTransTo());
		if (account.getBalance().compareTo(entity.getTransAmount()) < 0) {
			throw new AccountBalanceWrongException(entity.getTransAmount());
		}
		if (BigDecimal.ZERO.compareTo(entity.getTransAmount()) > 0) {
			throw new AccountBalanceWrongException(entity.getTransAmount());
		}
		entity.setTransAmount(entity.getTransAmount().abs());
		// currency exchange
		BigDecimal rate1 = BigDecimal.ONE;
		BigDecimal rate2 = BigDecimal.ONE;
		if (!CodeConstants.BASE_EXCHANGE_RATE.equals(account.getCurrency())) {
			ExchangeRateRecord latestRecord = this.exchangeRateRecordFacade.latestRecord(account.getCurrency());
			if (AppUtil.isPresent(latestRecord)) {
				rate1 = latestRecord.getSpotBuy();
			}
		}
		if (!CodeConstants.BASE_EXCHANGE_RATE.equals(transferTo.getCurrency())) {
			ExchangeRateRecord latestRecord = this.exchangeRateRecordFacade.latestRecord(transferTo.getCurrency());
			if (AppUtil.isPresent(latestRecord)) {
				rate2 = latestRecord.getSpotBuy();
			}
		}
		account.setBalance(account.getBalance().subtract(entity.getTransAmount()));
		entity.setRate(rate1.divide(rate2, 5, RoundingMode.HALF_UP));
		transferTo.setBalance(transferTo.getBalance().add(entity.getTransAmount().multiply(entity.getRate())));
		entity.setTransFrom(accountId);
		entity.setDescription(MessageFormat.format(MessageConstant.ACCOUNT_TRANSFER_DESC, account.getName(), transferTo.getName(), entity.getDescription()));

		this.accountFacade.update(account);
		this.accountFacade.update(transferTo);
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

	private List<Account> syncCache(String name) {
		List<Account> entities = this.accountFacade.queryAll(name);
		entities.sort((Account a, Account b) -> {
			return a.getName().compareToIgnoreCase(b.getName());
		});
		this.userCache.opsForValue().set(MessageFormat.format(CodeConstants.ACCOUNT_LIST, name), entities);
		return entities;
	}
}
