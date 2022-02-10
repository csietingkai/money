package io.tingkai.money.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.text.MessageFormat;
import java.time.LocalDateTime;
import java.util.ArrayList;
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
import io.tingkai.money.entity.Stock;
import io.tingkai.money.entity.StockRecord;
import io.tingkai.money.entity.UserStock;
import io.tingkai.money.entity.UserStockRecord;
import io.tingkai.money.entity.UserTrackingStock;
import io.tingkai.money.enumeration.DealType;
import io.tingkai.money.facade.AccountFacade;
import io.tingkai.money.facade.AccountRecordFacade;
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
import io.tingkai.money.model.exception.StockAmountInvalidException;
import io.tingkai.money.model.vo.UserStockVo;
import io.tingkai.money.model.vo.UserTrackingStockVo;
import io.tingkai.money.util.AppUtil;

@Service
@Loggable
public class UserStockService {

	@Autowired
	private AccountFacade accountFacade;

	@Autowired
	private AccountRecordFacade accountRecordFacade;

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

	public List<UserStockVo> getOwnStocks(String username) {
		return getOwnStocks(username, true);
	}

	public List<UserStockVo> getOwnStocks(String username, boolean onlyShowHave) {
		List<UserStock> ownList = this.userStockFacade.queryByUsername(username);
		if (onlyShowHave) {
			ownList = ownList.stream().filter(x -> BigDecimal.ZERO.compareTo(x.getAmount()) < 0).collect(Collectors.toList());
		}
		Map<String, String> stockNames = this.stockFacade.queryAll().stream().collect(Collectors.toMap(Stock::getCode, Stock::getName));
		List<UserStockVo> vos = new ArrayList<UserStockVo>();
		ownList.forEach(stock -> {
			UserStockVo vo = new UserStockVo();
			vo.transform(stock);
			vo.setStockName(stockNames.getOrDefault(vo.getStockCode(), CodeConstants.EMPTY_STRING));
			StockRecord stockRecord = this.stockRecordFacade.latestRecord(vo.getStockCode());
			if (AppUtil.isPresent(stockRecord)) {
				vo.setPrice(stockRecord.getClosePrice());
				vo.setPriceDate(stockRecord.getDealDate());
			}
			vo.setCost(BigDecimal.ZERO);
			List<UserStockRecord> tradeRecords = this.userStockRecordFacade.queryAll(stock.getId());
			tradeRecords.forEach(tradeRecord -> {
				if (tradeRecord.getType() == DealType.BUY) {
					vo.setCost(vo.getCost().add(tradeRecord.getTotal()));
				} else if (tradeRecord.getType() == DealType.SELL) {
					vo.setCost(vo.getCost().subtract(tradeRecord.getTotal()));
				}
			});
			vos.add(vo);
		});
		return vos;
	}

	public UserStockRecord preCalc(DealType type, BigDecimal share, BigDecimal price) {
		UserStockRecord temp = new UserStockRecord();
		temp.setPrice(price);
		temp.setShare(share);
		temp.setFee(this.calcFee(price, share, CodeConstants.FEE_DISCOUNT_RATE));
		if (type == DealType.BUY) {
			temp.setTax(BigDecimal.ZERO);
		} else if (type == DealType.SELL) {
			temp.setTax(this.calcTax(price, share));
		}
		return temp;
	}

	public UserStock buy(String username, UUID accountId, String stockCode, LocalDateTime date, BigDecimal share, BigDecimal price, BigDecimal fix, BigDecimal fee) throws AccountBalanceNotEnoughException, StockAmountInvalidException, NotExistException, FieldMissingException, AlreadyExistException {
		if (BigDecimal.ZERO.compareTo(share) >= 0) {
			throw new StockAmountInvalidException(share);
		}
		Account account = this.accountFacade.query(accountId);
		BigDecimal total = price.multiply(share).add(fee).add(fix);
		if (account.getBalance().compareTo(total) < 0) {
			throw new AccountBalanceNotEnoughException(account.getName());
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

		AccountRecord accountRecord = new AccountRecord();
		accountRecord.setTransDate(date);
		accountRecord.setTransAmount(BigDecimal.ZERO.subtract(total));
		accountRecord.setTransFrom(account.getId());
		accountRecord.setTransTo(account.getId());
		accountRecord.setDescription(MessageFormat.format(MessageConstant.ACCOUNT_EXPEND_DESC, account.getName(), MessageFormat.format(MessageConstant.USER_STOCK_BUY_SUCCESS, username, stockCode, share, price)));
		this.accountRecordFacade.insert(accountRecord);

		UserStockRecord record = new UserStockRecord();
		record.setUserStockId(entity.getId());
		record.setAccountId(account.getId());
		record.setType(DealType.BUY);
		record.setDate(date);
		record.setShare(share);
		record.setPrice(price);
		record.setFee(fee);
		record.setTax(BigDecimal.ZERO);
		record.setTotal(total);
		record = this.userStockRecordFacade.insert(record);

		return entity;
	}

	public UserStock sell(String username, UUID accountId, String stockCode, LocalDateTime date, BigDecimal share, BigDecimal price, BigDecimal fix, BigDecimal fee, BigDecimal tax) throws StockAmountInvalidException, AlreadyExistException, FieldMissingException, NotExistException {
		if (BigDecimal.ZERO.compareTo(share) >= 0) {
			throw new StockAmountInvalidException(share);
		}

		UserStock entity = this.userStockFacade.queryByUsernameAndStockCode(username, stockCode);
		if (entity.getAmount().compareTo(share) < 0) {
			throw new StockAmountInvalidException(share);
		}
		entity.setAmount(entity.getAmount().subtract(share));
		entity = this.userStockFacade.update(entity);

		Account account = this.accountFacade.query(accountId);
		BigDecimal total = price.multiply(share).subtract(fee).subtract(tax).subtract(fix);
		account.setBalance(account.getBalance().add(total));
		account = this.accountFacade.update(account);

		AccountRecord accountRecord = new AccountRecord();
		accountRecord.setTransDate(date);
		accountRecord.setTransAmount(total);
		accountRecord.setTransFrom(account.getId());
		accountRecord.setTransTo(account.getId());
		accountRecord.setDescription(MessageFormat.format(MessageConstant.ACCOUNT_EXPEND_DESC, account.getName(), MessageFormat.format(MessageConstant.USER_STOCK_SELL_SUCCESS, username, stockCode, share, price)));
		this.accountRecordFacade.insert(accountRecord);

		UserStockRecord record = new UserStockRecord();
		record.setUserStockId(entity.getId());
		record.setAccountId(account.getId());
		record.setType(DealType.SELL);
		record.setDate(date);
		record.setShare(share);
		record.setPrice(price);
		record.setFee(fee);
		record.setTax(tax);
		record.setTotal(total);
		record = this.userStockRecordFacade.insert(record);

		return entity;
	}

	public List<UserStockRecord> getAllRecords(String username, String accountName) {
		Account account = this.accountFacade.query(accountName, username);
		return this.userStockRecordFacade.queryByAccountId(account.getId());
	}

	public List<UserTrackingStockVo> getUserTrackingStockList(String username) {
		String cacheKey = MessageFormat.format(CodeConstants.USER_TRACKING_STOCK_KEY, username);
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

			List<StockRecord> records = this.stockRecordFacade.queryAll(x.getStockCode());
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

	public void track(String username, String stockCode) throws AlreadyExistException, FieldMissingException {
		UserTrackingStock entity = new UserTrackingStock();
		entity.setUserName(username);
		entity.setStockCode(stockCode);
		this.userTrackingStockFacade.insert(entity);
		this.syncTrackingCache(username);
	}

	public void untrack(String username, String stockCode) throws NotExistException {
		UserTrackingStock entity = this.userTrackingStockFacade.query(username, stockCode);
		this.userTrackingStockFacade.delete(entity.getId());
		this.syncTrackingCache(username);
	}

	private BigDecimal calcFee(BigDecimal price, BigDecimal share, BigDecimal discount) {
		BigDecimal fee = CodeConstants.FEE_RATE.multiply(price).multiply(share).multiply(discount);
		BigDecimal minFee = CodeConstants.MIN_FEE;
		if (!AppUtil.isMultipleNumber(share, BigDecimal.valueOf(1000))) {
			minFee = CodeConstants.MIN_SMALL_FEE;
		}
		if (minFee.compareTo(fee) > 0 && BigDecimal.ZERO.compareTo(fee) != 0) {
			fee = minFee;
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
		String cacheKey = MessageFormat.format(CodeConstants.USER_TRACKING_STOCK_KEY, username);
		List<UserTrackingStock> trackingList = this.userTrackingStockFacade.queryAll(username);
		this.userCache.opsForValue().set(cacheKey, trackingList);
	}
}
