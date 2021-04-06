package io.tingkai.money.service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import io.tingkai.money.constant.DatabaseConstants;
import io.tingkai.money.dao.UserStockDao;
import io.tingkai.money.entity.Account;
import io.tingkai.money.entity.UserStock;
import io.tingkai.money.model.exception.AccountBalanceNotEnoughException;
import io.tingkai.money.model.exception.QueryNotResultException;
import io.tingkai.money.model.exception.StockAmountInvalidException;

@Service
public class UserStockService {

	@Autowired
	private AccountService accountService;

	@Autowired
	private UserStockRecordService userStockRecordService;

	@Autowired
	private UserStockDao userStockDao;

	public List<UserStock> getAll(String username) throws QueryNotResultException {
		List<UserStock> entities = new ArrayList<UserStock>();
		Iterable<UserStock> iterable = this.userStockDao.findByUserName(username);
		iterable.forEach(entities::add);
		if (entities.size() == 0) {
			throw new QueryNotResultException(DatabaseConstants.TABLE_USER_STOCK);
		}
		return entities;
	}

	public UserStock get(String username, String stockCode) throws QueryNotResultException {
		Optional<UserStock> optional = this.userStockDao.findByUserNameAndStockCode(username, stockCode);
		if (optional.isEmpty()) {
			throw new QueryNotResultException(DatabaseConstants.TABLE_ACCOUNT_RECORD);
		}
		return optional.get();
	}

	public UserStock buy(String username, String accountName, String stockCode, LocalDateTime date, BigDecimal share, BigDecimal price) throws QueryNotResultException, AccountBalanceNotEnoughException, StockAmountInvalidException {
		Account account = this.accountService.get(accountName, username);
		BigDecimal total = price.multiply(share);
		total = total.add(this.userStockRecordService.calcFee(price, share));
		if (account.getBalance().compareTo(total) < 0) {
			throw new AccountBalanceNotEnoughException(accountName);
		}

		if (BigDecimal.ZERO.compareTo(share) >= 0) {
			throw new StockAmountInvalidException(share);
		}

		UserStock entity = new UserStock();
		Optional<UserStock> optional = this.userStockDao.findByUserNameAndStockCode(username, stockCode);
		if (optional.isPresent()) {
			entity = optional.get();
			entity.setAmount(entity.getAmount().add(share));
		} else {
			entity.setUserName(username);
			entity.setStockCode(stockCode);
			entity.setAmount(share);
		}
		entity = this.userStockDao.save(entity);
		this.userStockRecordService.buy(entity.getId(), date, share, price);
		return entity;
	}

	public UserStock sell(String username, String stockCode, LocalDateTime date, BigDecimal share, BigDecimal price) throws StockAmountInvalidException {
		if (BigDecimal.ZERO.compareTo(share) >= 0) {
			throw new StockAmountInvalidException(share);
		}

		UserStock entity = new UserStock();
		Optional<UserStock> optional = this.userStockDao.findByUserNameAndStockCode(username, stockCode);
		if (optional.isPresent()) {
			entity = optional.get();
			entity.setAmount(entity.getAmount().subtract(share));
		} else {
			entity.setUserName(username);
			entity.setStockCode(stockCode);
			entity.setAmount(share);
		}
		entity = this.userStockDao.save(entity);
		this.userStockRecordService.buy(entity.getId(), date, share, price);
		return entity;
	}
}
