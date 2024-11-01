package io.tingkai.money.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
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
import io.tingkai.money.model.request.StockBonusRequest;
import io.tingkai.money.model.request.StockBuyRequest;
import io.tingkai.money.model.request.StockSellRequest;
import io.tingkai.money.model.request.StockTradeRecordEditRequest;
import io.tingkai.money.model.vo.UserStockRecordVo;
import io.tingkai.money.model.vo.UserStockVo;
import io.tingkai.money.model.vo.UserTrackingStockVo;
import io.tingkai.money.util.AppUtil;
import io.tingkai.money.util.ContextUtil;
import io.tingkai.money.util.TimeUtil;

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

	public List<UserStockRecordVo> getOwnStockRecords(UUID userStockId) {
		List<UserStockRecord> entities = this.userStockRecordFacade.queryAll(userStockId);
		List<UUID> accountRecordIds = entities.stream().map(UserStockRecord::getAccountRecordId).distinct().toList();
		List<AccountRecord> accountRecords = this.accountRecordFacade.queryAll(accountRecordIds);
		Map<UUID, UUID> accountRecordFileIdMap = accountRecords.stream().collect(HashMap::new, (map, accountRecord) -> map.put(accountRecord.getId(), accountRecord.getFileId()), HashMap::putAll);
		List<UserStockRecordVo> vos = new ArrayList<UserStockRecordVo>();
		for (UserStockRecord record : entities) {
			UserStockRecordVo vo = new UserStockRecordVo();
			vo.transform(record);
			vo.setFileId(accountRecordFileIdMap.getOrDefault(record.getAccountRecordId(), null));
			vos.add(vo);
		}
		return vos;
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
	public UserStock buy(StockBuyRequest request) throws AccountBalanceNotEnoughException, StockAmountInvalidException, NotExistException, FieldMissingException, AlreadyExistException {
		UUID accountId = request.getAccountId();
		String stockCode = request.getStockCode();
		LocalDateTime date = TimeUtil.convertToDate(request.getDate());
		BigDecimal share = request.getShare();
		BigDecimal price = request.getPrice();
		BigDecimal fee = request.getFee();
		BigDecimal total = request.getTotal();
		UUID fileId = request.getFileId();

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
	public UserStock sell(StockSellRequest request) throws StockAmountInvalidException, AlreadyExistException, FieldMissingException, NotExistException {
		UUID accountId = request.getAccountId();
		String stockCode = request.getStockCode();
		LocalDateTime date = TimeUtil.convertToDate(request.getDate());
		BigDecimal share = request.getShare();
		BigDecimal price = request.getPrice();
		BigDecimal fee = request.getFee();
		BigDecimal tax = request.getTax();
		BigDecimal total = request.getTotal();
		UUID fileId = request.getFileId();

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

	@Transactional
	public UserStock bonus(StockBonusRequest request) throws StockAmountInvalidException, NotExistException, FieldMissingException, AlreadyExistException {
		UUID accountId = request.getAccountId();
		String stockCode = request.getStockCode();
		LocalDateTime date = TimeUtil.convertToDate(request.getDate());
		BigDecimal share = request.getShare();
		BigDecimal price = request.getPrice();
		BigDecimal fee = request.getFee();
		BigDecimal total = request.getTotal();
		UUID fileId = request.getFileId();

		UUID userId = ContextUtil.getUserId();
		if (BigDecimal.ZERO.compareTo(share) >= 0) {
			throw new StockAmountInvalidException(share);
		}

		UserStock entity = this.userStockFacade.queryByUserIdAndStockCode(userId, stockCode);

		Account account = this.accountFacade.query(accountId);
		account.setBalance(account.getBalance().add(total));
		account = this.accountFacade.update(account);

		AccountRecord accountRecord = new AccountRecord();
		accountRecord.setTransDate(date);
		accountRecord.setTransAmount(total);
		accountRecord.setTransFrom(account.getId());
		accountRecord.setTransTo(account.getId());
		accountRecord.setRecordType(RecordType.INVEST);
		accountRecord.setDescription(MessageFormat.format(MessageConstant.USER_STOCK_BONUS_SUCCESS, total, stockCode));
		accountRecord.setFileId(fileId);
		accountRecord = this.accountRecordFacade.insert(accountRecord);

		UserStockRecord record = new UserStockRecord();
		record.setUserStockId(entity.getId());
		record.setAccountId(account.getId());
		record.setType(DealType.BONUS);
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
	public UserStock updateRecord(StockTradeRecordEditRequest request) throws StockAmountInvalidException, NotExistException, FieldMissingException {
		UUID recordId = request.getRecordId();
		UUID accountId = request.getAccountId();
		String stockCode = request.getStockCode();
		LocalDateTime date = TimeUtil.convertToDate(request.getDate());
		BigDecimal share = request.getShare();
		BigDecimal price = request.getPrice();
		BigDecimal fee = request.getFee();
		BigDecimal tax = request.getTax();
		BigDecimal total = request.getTotal();
		UUID fileId = request.getFileId();
		UUID accountRecordId = request.getAccountRecordId();
		UUID userId = ContextUtil.getUserId();

		if (BigDecimal.ZERO.compareTo(share) >= 0) {
			throw new StockAmountInvalidException(share);
		}

		UserStockRecord tradeRecord = this.userStockRecordFacade.query(recordId);
		if (AppUtil.isEmpty(tradeRecord)) {
			throw new NotExistException();
		}
		// handle origin account record and user stock record
		{
			UserStock userStock = this.userStockFacade.query(tradeRecord.getUserStockId());
			if (tradeRecord.getType() == DealType.BUY) {
				userStock.setAmount(userStock.getAmount().subtract(tradeRecord.getShare()));
			} else if (tradeRecord.getType() == DealType.SELL) {
				userStock.setAmount(userStock.getAmount().add(tradeRecord.getShare()));
			}
			userStock = this.userStockFacade.update(userStock);

			Account account = this.accountFacade.query(tradeRecord.getAccountId());
			AccountRecord accountRecord = this.accountRecordFacade.query(tradeRecord.getAccountRecordId());
			account.setBalance(account.getBalance().subtract(accountRecord.getTransAmount()));
			account = this.accountFacade.update(account);
		}

		UserStock userStock = this.userStockFacade.queryByUserIdAndStockCode(userId, stockCode);
		if (tradeRecord.getType() == DealType.BUY) {
			userStock.setAmount(userStock.getAmount().add(share));
		} else if (tradeRecord.getType() == DealType.SELL) {
			userStock.setAmount(userStock.getAmount().subtract(share));
		}
		userStock = this.userStockFacade.update(userStock);

		Account account = this.accountFacade.query(accountId);
		if (tradeRecord.getType() == DealType.BUY) {
			account.setBalance(account.getBalance().subtract(total));
		} else if (tradeRecord.getType() == DealType.SELL || tradeRecord.getType() == DealType.BONUS) {
			account.setBalance(account.getBalance().add(total));
		}
		account = this.accountFacade.update(account);

		AccountRecord accountRecord = this.accountRecordFacade.query(accountRecordId);
		if (tradeRecord.getType() == DealType.BUY) {
			accountRecord.setDescription(MessageFormat.format(MessageConstant.USER_STOCK_BUY_SUCCESS, stockCode, share, price));
			accountRecord.setTransAmount(BigDecimal.ZERO.subtract(total));
		} else if (tradeRecord.getType() == DealType.SELL) {
			accountRecord.setDescription(MessageFormat.format(MessageConstant.USER_STOCK_SELL_SUCCESS, stockCode, share, price));
			accountRecord.setTransAmount(total);
		} else if (tradeRecord.getType() == DealType.BONUS) {
			accountRecord.setDescription(MessageFormat.format(MessageConstant.USER_STOCK_BONUS_SUCCESS, total, stockCode));
			accountRecord.setTransAmount(total);
		}
		accountRecord.setTransFrom(accountId);
		accountRecord.setTransTo(accountId);
		accountRecord.setTransDate(date);
		accountRecord.setFileId(fileId);
		accountRecord = this.accountRecordFacade.update(accountRecord);

		tradeRecord.setAccountId(accountId);
		tradeRecord.setUserStockId(userStock.getId());
		tradeRecord.setDate(date);
		tradeRecord.setShare(share);
		tradeRecord.setPrice(price);
		tradeRecord.setFee(fee);
		if (tradeRecord.getType() == DealType.SELL) {
			tradeRecord.setTax(tax);
		}
		tradeRecord.setTotal(total);
		tradeRecord = this.userStockRecordFacade.update(tradeRecord);

		return userStock;
	}

	@Transactional
	public void reverseRecord(UUID recordId) throws NotExistException, FieldMissingException {
		UserStockRecord userStockRecord = this.userStockRecordFacade.query(recordId);

		if (AppUtil.isEmpty(userStockRecord)) {
			throw new NotExistException();
		}

		this.userStockRecordFacade.delete(recordId);

		UserStock userStock = this.userStockFacade.query(userStockRecord.getUserStockId());
		if (userStockRecord.getType() == DealType.BUY) {
			userStock.setAmount(userStock.getAmount().subtract(userStockRecord.getShare()));
		} else if (userStockRecord.getType() == DealType.SELL) {
			userStock.setAmount(userStock.getAmount().add(userStockRecord.getShare()));
		}

		Account account = this.accountFacade.query(userStockRecord.getAccountId());
		AccountRecord accountRecord = this.accountRecordFacade.query(userStockRecord.getAccountRecordId());
		account.setBalance(account.getBalance().subtract(accountRecord.getTransAmount()));
		this.accountFacade.update(account);
		this.accountRecordFacade.delete(accountRecord.getId());
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

	public void track(String stockCode) throws AlreadyExistException, FieldMissingException {
		UUID userId = ContextUtil.getUserId();
		UserTrackingStock entity = new UserTrackingStock();
		entity.setUserId(userId);
		entity.setStockCode(stockCode);
		this.userTrackingStockFacade.insert(entity);
		this.syncTrackingCache(userId);
	}

	public void untrack(String stockCode) throws NotExistException {
		UUID userId = ContextUtil.getUserId();
		UserTrackingStock entity = this.userTrackingStockFacade.query(userId, stockCode);
		this.userTrackingStockFacade.delete(entity.getId());
		this.syncTrackingCache(userId);
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
