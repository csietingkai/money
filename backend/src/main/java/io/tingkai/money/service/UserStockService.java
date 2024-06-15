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
import org.springframework.transaction.annotation.Transactional;

import io.tingkai.money.constant.CodeConstants;
import io.tingkai.money.constant.MessageConstant;
import io.tingkai.money.entity.Account;
import io.tingkai.money.entity.AccountRecord;
import io.tingkai.money.entity.Stock;
import io.tingkai.money.entity.StockRecord;
import io.tingkai.money.entity.UserSetting;
import io.tingkai.money.entity.UserStock;
import io.tingkai.money.entity.UserStockRecord;
import io.tingkai.money.entity.UserTrackingStock;
import io.tingkai.money.enumeration.DealType;
import io.tingkai.money.enumeration.option.RecordType;
import io.tingkai.money.facade.AccountFacade;
import io.tingkai.money.facade.AccountRecordFacade;
import io.tingkai.money.facade.StockFacade;
import io.tingkai.money.facade.StockRecordFacade;
import io.tingkai.money.facade.UserSettingFacade;
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
import io.tingkai.money.util.ContextUtil;

@Service
@Loggable
public class UserStockService {

	@Autowired
	private UserSettingFacade userSettingFacade;

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

	public List<UserStockVo> getOwnStocks() {
		return getOwnStocks(true);
	}

	public List<UserStockVo> getOwnStocks(boolean onlyShowHave) {
		UUID userId = ContextUtil.getUserId();
		List<UserStock> ownList = this.userStockFacade.queryByUserId(userId);
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
		vos.sort((vo1, vo2) -> {
			if (vo1.getStockCode().length() != vo2.getStockCode().length()) {
				return vo1.getStockCode().length() - vo2.getStockCode().length();
			}
			return vo1.getStockCode().compareTo(vo2.getStockCode());
		});
		return vos;
	}

	public List<UserStockRecord> getOwnStockRecords(UUID userStockId) {
		return this.userStockRecordFacade.queryAll(userStockId);
	}

	public UserStockRecord preCalc(DealType type, BigDecimal share, BigDecimal price) {
		UserStockRecord temp = new UserStockRecord();
		temp.setPrice(price);
		temp.setShare(share);
		UserSetting setting = this.userSettingFacade.queryByUserId(ContextUtil.getUserId());
		temp.setFee(this.calcFee(price, share, setting.getStockFeeRate()));
		if (type == DealType.BUY) {
			temp.setTax(BigDecimal.ZERO);
		} else if (type == DealType.SELL) {
			temp.setTax(this.calcTax(price, share));
		}
		return temp;
	}

	@Transactional
	public UserStock buy(UUID accountId, String stockCode, LocalDateTime date, BigDecimal share, BigDecimal price, BigDecimal fee, BigDecimal total, UUID fileId) throws AccountBalanceNotEnoughException, StockAmountInvalidException, NotExistException, FieldMissingException, AlreadyExistException {
		UUID userId = ContextUtil.getUserId();
		if (BigDecimal.ZERO.compareTo(share) >= 0) {
			throw new StockAmountInvalidException(share);
		}
		Account account = this.accountFacade.query(accountId);
		if (account.getBalance().compareTo(total) < 0) {
			throw new AccountBalanceNotEnoughException(account.getName());
		}

		UserStock entity = null;
		try {
			entity = this.userStockFacade.queryByUserIdAndStockCode(userId, stockCode);
		} catch (Exception e) {
		}
		if (AppUtil.isPresent(entity)) {
			entity.setAmount(entity.getAmount().add(share));
			entity = this.userStockFacade.update(entity);
		} else {
			entity = new UserStock();
			entity.setUserId(userId);
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
		accountRecord.setRecordType(RecordType.INVEST);
		accountRecord.setDescription(MessageFormat.format(MessageConstant.USER_STOCK_BUY_SUCCESS, stockCode, share, price));
		accountRecord.setFileId(fileId);
		accountRecord = this.accountRecordFacade.insert(accountRecord);

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
		record.setAccountRecordId(accountRecord.getId());
		record = this.userStockRecordFacade.insert(record);

		return entity;
	}

	@Transactional
	public UserStock sell(UUID accountId, String stockCode, LocalDateTime date, BigDecimal share, BigDecimal price, BigDecimal fee, BigDecimal tax, BigDecimal total, UUID fileId) throws StockAmountInvalidException, AlreadyExistException, FieldMissingException, NotExistException {
		UUID userId = ContextUtil.getUserId();
		if (BigDecimal.ZERO.compareTo(share) >= 0) {
			throw new StockAmountInvalidException(share);
		}

		UserStock entity = this.userStockFacade.queryByUserIdAndStockCode(userId, stockCode);
		if (entity.getAmount().compareTo(share) < 0) {
			throw new StockAmountInvalidException(share);
		}
		entity.setAmount(entity.getAmount().subtract(share));
		entity = this.userStockFacade.update(entity);

		Account account = this.accountFacade.query(accountId);
		account.setBalance(account.getBalance().add(total));
		account = this.accountFacade.update(account);

		AccountRecord accountRecord = new AccountRecord();
		accountRecord.setTransDate(date);
		accountRecord.setTransAmount(total);
		accountRecord.setTransFrom(account.getId());
		accountRecord.setTransTo(account.getId());
		accountRecord.setRecordType(RecordType.INVEST);
		accountRecord.setDescription(MessageFormat.format(MessageConstant.USER_STOCK_SELL_SUCCESS, stockCode, share, price));
		accountRecord.setFileId(fileId);
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
		record.setAccountRecordId(accountRecord.getId());
		record = this.userStockRecordFacade.insert(record);

		return entity;
	}

	public List<UserTrackingStockVo> getUserTrackingStockList(UUID userId) {
		String cacheKey = MessageFormat.format(CodeConstants.USER_TRACKING_STOCK_KEY, userId);
		List<UserTrackingStock> trackingList = this.userCache.opsForValue().get(cacheKey);
		if (AppUtil.isEmpty(trackingList)) {
			trackingList = this.userTrackingStockFacade.queryAll(userId);
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

	public void track(UUID userId, String stockCode) throws AlreadyExistException, FieldMissingException {
		UserTrackingStock entity = new UserTrackingStock();
		entity.setUserId(userId);
		entity.setStockCode(stockCode);
		this.userTrackingStockFacade.insert(entity);
		this.syncTrackingCache(userId);
	}

	public void untrack(UUID username, String stockCode) throws NotExistException {
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
		;
		tax = tax.setScale(0, RoundingMode.FLOOR);
		return tax;
	}

	private void syncTrackingCache(UUID userId) {
		String cacheKey = MessageFormat.format(CodeConstants.USER_TRACKING_STOCK_KEY, userId);
		List<UserTrackingStock> trackingList = this.userTrackingStockFacade.queryAll(userId);
		this.userCache.opsForValue().set(cacheKey, trackingList);
	}
}
