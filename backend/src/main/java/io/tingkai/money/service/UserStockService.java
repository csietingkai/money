package io.tingkai.money.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import io.tingkai.money.constant.CodeConstants;
import io.tingkai.money.entity.Account;
import io.tingkai.money.entity.Stock;
import io.tingkai.money.entity.StockRecord;
import io.tingkai.money.entity.UserStock;
import io.tingkai.money.entity.UserStockRecord;
import io.tingkai.money.entity.UserTrackingStock;
import io.tingkai.money.enumeration.DealType;
import io.tingkai.money.facade.AccountFacade;
import io.tingkai.money.facade.StockFacade;
import io.tingkai.money.facade.StockRecordFacade;
import io.tingkai.money.facade.UserStockFacade;
import io.tingkai.money.facade.UserStockRecordFacade;
import io.tingkai.money.facade.UserTrackingStockFacade;
import io.tingkai.money.logging.Loggable;
import io.tingkai.money.model.exception.AccountBalanceNotEnoughException;
import io.tingkai.money.model.exception.AlreadyExistException;
import io.tingkai.money.model.exception.FieldMissingException;
import io.tingkai.money.model.exception.NotExistException;
import io.tingkai.money.model.exception.QueryNotResultException;
import io.tingkai.money.model.exception.StockAmountInvalidException;
import io.tingkai.money.model.vo.UserTrackingStockVo;
import io.tingkai.money.util.AppUtil;

@Service
@Loggable
public class UserStockService {

	@Autowired
	private AccountFacade accountFacade;

	@Autowired
	private StockFacade stockFacade;

	@Autowired
	private StockRecordFacade stockRecordFacade;

	@Autowired
	private UserStockFacade userStockFacade;

	@Autowired
	private UserStockRecordFacade userStockRecordFacade;

	@Autowired
	private UserTrackingStockFacade userTrackingStockFacade;

	@Autowired
	@Qualifier(CodeConstants.USER_CACHE)
	private RedisTemplate<String, List<UserTrackingStock>> userCache;

	public List<UserStock> getAll(String username) throws QueryNotResultException {
		return getAll(username, true);
	}

	public List<UserStock> getAll(String username, boolean onlyShowHave) throws QueryNotResultException {
		List<UserStock> entities = this.userStockFacade.queryByUsername(username);
		if (onlyShowHave) {
			entities = entities.stream().filter(x -> BigDecimal.ZERO.compareTo(x.getAmount()) < 0).collect(Collectors.toList());
		}
		return entities;
	}

	public UserStock buy(String username, String accountName, String stockCode, LocalDateTime date, BigDecimal share, BigDecimal price) throws QueryNotResultException, AccountBalanceNotEnoughException, StockAmountInvalidException, NotExistException, FieldMissingException, AlreadyExistException {
		Account account = this.accountFacade.query(accountName, username);
		BigDecimal total = price.multiply(share);
		total = total.add(this.calcFee(price, share, CodeConstants.FEE_DISCOUNT_RATE));
		if (account.getBalance().compareTo(total) < 0) {
			throw new AccountBalanceNotEnoughException(accountName);
		}
		if (BigDecimal.ZERO.compareTo(share) >= 0) {
			throw new StockAmountInvalidException(share);
		}

		UserStock entity = null;
		try {
			entity = this.userStockFacade.queryByUsernameAndStockCode(username, stockCode);
		} catch (Exception e) {
		}
		if (AppUtil.isPresent(entity)) {
			entity.setAmount(entity.getAmount().add(share));
			entity = this.userStockFacade.update(entity);
		} else {
			entity = new UserStock();
			entity.setUserName(username);
			entity.setStockCode(stockCode);
			entity.setAmount(share);
			entity = this.userStockFacade.insert(entity);
		}

		account.setBalance(account.getBalance().subtract(total));
		account = this.accountFacade.update(account);

		UserStockRecord record = new UserStockRecord();
		record.setUserStockId(entity.getId());
		record.setAccountId(account.getId());
		record.setType(DealType.BUY);
		record.setDate(date);
		record.setShare(share);
		record.setPrice(price);
		record.setFee(this.calcFee(price, share, CodeConstants.FEE_DISCOUNT_RATE));
		record.setTax(BigDecimal.ZERO);
		record = this.userStockRecordFacade.insert(record);

		return entity;
	}

	public UserStock sell(String username, String accountName, String stockCode, LocalDateTime date, BigDecimal share, BigDecimal price) throws StockAmountInvalidException, AlreadyExistException, FieldMissingException, NotExistException, QueryNotResultException {
		if (BigDecimal.ZERO.compareTo(share) >= 0) {
			throw new StockAmountInvalidException(share);
		}

		UserStock entity = null;
		try {
			entity = this.userStockFacade.queryByUsernameAndStockCode(username, stockCode);
		} catch (Exception e) {
		}
		if (AppUtil.isPresent(entity)) {
			entity.setAmount(entity.getAmount().subtract(share));
			entity = this.userStockFacade.update(entity);
		} else {
			entity = new UserStock();
			entity.setUserName(username);
			entity.setStockCode(stockCode);
			entity.setAmount(share);
			entity = this.userStockFacade.insert(entity);
		}

		Account account = this.accountFacade.query(accountName, username);
		BigDecimal total = price.multiply(share);
		total = total.add(this.calcFee(price, share, CodeConstants.FEE_DISCOUNT_RATE));
		account.setBalance(account.getBalance().subtract(total));
		account = this.accountFacade.update(account);

		UserStockRecord record = new UserStockRecord();
		record.setUserStockId(entity.getId());
		record.setAccountId(account.getId());
		record.setType(DealType.SELL);
		record.setDate(date);
		record.setShare(share);
		record.setPrice(price);
		record.setFee(this.calcFee(price, share, CodeConstants.FEE_DISCOUNT_RATE));
		record.setTax(this.calcTax(price, share));
		record = this.userStockRecordFacade.insert(record);

		return entity;
	}

	public List<UserStockRecord> getAllRecords(String username, String accountName) throws QueryNotResultException {
		Account account = this.accountFacade.query(accountName, username);
		return this.userStockRecordFacade.queryByAccountId(account.getId());
	}

	public List<UserTrackingStockVo> getUserTrackingStockList(String username) throws QueryNotResultException {
		String cacheKey = CodeConstants.USER_TRACKING_STOCK_KEY + username;
		List<UserTrackingStock> trackingList = this.userCache.opsForValue().get(cacheKey);
		if (AppUtil.isEmpty(trackingList)) {
			trackingList = this.userTrackingStockFacade.queryAll(username);
			this.userCache.opsForValue().set(cacheKey, trackingList);
		}

		List<UserTrackingStockVo> list = new ArrayList<UserTrackingStockVo>();
		for (UserTrackingStock x : trackingList) {
			UserTrackingStockVo vo = new UserTrackingStockVo();
			vo.transform(x);

			Stock info = this.stockFacade.query(x.getStockCode());
			vo.setStockName(info.getName());

			List<StockRecord> records = new ArrayList<StockRecord>();
			try {
				records = this.stockRecordFacade.queryAll(x.getStockCode());
			} catch (QueryNotResultException e) {
			}
			if (records.size() > 0) {
				StockRecord r0 = records.get(records.size() - 1);
				vo.setRecord(r0);
				if (records.size() > 1) {
					StockRecord r1 = records.get(records.size() - 2);
					vo.setAmplitude(r0.getClosePrice().subtract(r1.getClosePrice()));
				}
			}
			list.add(vo);
		}
		return list;
	}

	public void track(String username, String stockCode) throws AlreadyExistException, FieldMissingException, QueryNotResultException {
		UserTrackingStock entity = new UserTrackingStock();
		entity.setUserName(username);
		entity.setStockCode(stockCode);
		this.userTrackingStockFacade.insert(entity);
		this.syncTrackingCache(username);
	}

	public void untrack(String username, String stockCode) throws QueryNotResultException, NotExistException {
		UserTrackingStock entity = this.userTrackingStockFacade.query(username, stockCode);
		this.userTrackingStockFacade.delete(entity.getId());
		this.syncTrackingCache(username);
	}

	private BigDecimal calcFee(BigDecimal price, BigDecimal share, BigDecimal discount) {
		BigDecimal fee = CodeConstants.FEE_RATE.multiply(price).multiply(share).multiply(discount);
		if (CodeConstants.MIN_FEE.compareTo(fee) > 0) {
			fee = CodeConstants.MIN_FEE;
		}
		fee = fee.setScale(0, RoundingMode.FLOOR);
		return fee;
	}

	private BigDecimal calcTax(BigDecimal price, BigDecimal share) {
		BigDecimal tax = CodeConstants.TAX_RATE.multiply(price).multiply(share);
		tax = tax.setScale(0, RoundingMode.FLOOR);
		return tax;
	}

	private void syncTrackingCache(String username) {
		String cacheKey = CodeConstants.USER_TRACKING_STOCK_KEY + username;
		List<UserTrackingStock> trackingList = new ArrayList<UserTrackingStock>();
		try {
			trackingList.addAll(this.userTrackingStockFacade.queryAll(username));
		} catch (QueryNotResultException e) {
		}
		this.userCache.opsForValue().set(cacheKey, trackingList);
	}
}
