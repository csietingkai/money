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

import io.tingkai.auth.constant.AuthConstant;
import io.tingkai.auth.util.ContextUtil;
import io.tingkai.base.constant.BaseCodeConstant;
import io.tingkai.base.log.Loggable;
import io.tingkai.base.model.exception.AlreadyExistException;
import io.tingkai.base.model.exception.FieldMissingException;
import io.tingkai.base.model.exception.NotExistException;
import io.tingkai.base.util.BaseAppUtil;
import io.tingkai.money.constant.CodeConstant;
import io.tingkai.money.constant.MessageConstant;
import io.tingkai.money.entity.Account;
import io.tingkai.money.entity.AccountRecord;
import io.tingkai.money.entity.Fund;
import io.tingkai.money.entity.FundRecord;
import io.tingkai.money.entity.UserFund;
import io.tingkai.money.entity.UserFundRecord;
import io.tingkai.money.entity.UserTrackingFund;
import io.tingkai.money.enumeration.DealType;
import io.tingkai.money.enumeration.option.RecordType;
import io.tingkai.money.facade.AccountFacade;
import io.tingkai.money.facade.AccountRecordFacade;
import io.tingkai.money.facade.FundFacade;
import io.tingkai.money.facade.FundRecordFacade;
import io.tingkai.money.facade.UserFundFacade;
import io.tingkai.money.facade.UserFundRecordFacade;
import io.tingkai.money.facade.UserSettingFacade;
import io.tingkai.money.facade.UserTrackingFundFacade;
import io.tingkai.money.model.exception.AccountBalanceNotEnoughException;
import io.tingkai.money.model.exception.FundAmountInvalidException;
import io.tingkai.money.model.exception.StockAmountInvalidException;
import io.tingkai.money.model.request.FundBonusRequest;
import io.tingkai.money.model.request.FundBuyRequest;
import io.tingkai.money.model.request.FundSellRequest;
import io.tingkai.money.model.request.FundTradeRecordEditRequest;
import io.tingkai.money.model.vo.UserFundRecordVo;
import io.tingkai.money.model.vo.UserFundVo;
import io.tingkai.money.model.vo.UserTrackingFundVo;

@Service
@Loggable
public class UserFundService {

	@Autowired
	private UserSettingFacade userSettingFacade;

	@Autowired
	private AccountFacade accountFacade;

	@Autowired
	private AccountRecordFacade accountRecordFacade;

	@Autowired
	private FundFacade fundFacade;

	@Autowired
	private FundRecordFacade fundRecordFacade;

	@Autowired
	private UserFundFacade userFundFacade;

	@Autowired
	private UserFundRecordFacade userFundRecordFacade;

	@Autowired
	private UserTrackingFundFacade userTrackingFundFacade;

	@Autowired
	@Qualifier(AuthConstant.AUTH_CACHE)
	private RedisTemplate<String, List<UserTrackingFund>> userCache;

	public List<UserFundVo> getOwnFunds() {
		UUID userId = ContextUtil.getUserId();
		boolean onlyShowOwn = this.userSettingFacade.queryByUserId(userId).getOnlyShowOwnFund();
		List<UserFund> ownList = this.userFundFacade.queryByUserId(userId);
		if (onlyShowOwn) {
			ownList = ownList.stream().filter(x -> BigDecimal.ZERO.compareTo(x.getAmount()) < 0).collect(Collectors.toList());
		}
		Map<String, String> fundNames = this.fundFacade.queryAll().stream().collect(Collectors.toMap(Fund::getCode, Fund::getName));
		List<UserFundVo> vos = new ArrayList<UserFundVo>();
		ownList.forEach(fund -> {
			UserFundVo vo = new UserFundVo();
			vo.transform(fund);
			vo.setFundName(fundNames.getOrDefault(vo.getFundCode(), BaseCodeConstant.EMPTY_STRING));
			FundRecord fundRecord = this.fundRecordFacade.latestRecord(vo.getFundCode());
			if (BaseAppUtil.isPresent(fundRecord)) {
				vo.setPrice(fundRecord.getPrice());
				vo.setPriceDate(fundRecord.getDate());
			}
			vo.setCost(BigDecimal.ZERO);
			List<UserFundRecord> tradeRecords = this.userFundRecordFacade.queryAll(fund.getId());
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
			if (vo1.getFundCode().length() != vo2.getFundCode().length()) {
				return vo1.getFundCode().length() - vo2.getFundCode().length();
			}
			return vo1.getFundCode().compareTo(vo2.getFundCode());
		});
		return vos;
	}

	public List<UserFundRecordVo> getOwnFundRecords(UUID userFundId) {
		List<UserFundRecord> entities = this.userFundRecordFacade.queryAll(userFundId);
		List<UUID> accountRecordIds = entities.stream().map(UserFundRecord::getAccountRecordId).distinct().collect(Collectors.toList());
		List<AccountRecord> accountRecords = this.accountRecordFacade.queryAll(accountRecordIds);
		Map<UUID, UUID> accountRecordFileIdMap = accountRecords.stream().collect(HashMap::new, (map, accountRecord) -> map.put(accountRecord.getId(), accountRecord.getFileId()), HashMap::putAll);
		List<UserFundRecordVo> vos = new ArrayList<UserFundRecordVo>();
		for (UserFundRecord record : entities) {
			UserFundRecordVo vo = new UserFundRecordVo();
			vo.transform(record);
			vo.setFileId(accountRecordFileIdMap.getOrDefault(record.getAccountRecordId(), null));
			vos.add(vo);
		}
		return vos;
	}

	@Transactional
	public UserFund buy(FundBuyRequest request) throws AccountBalanceNotEnoughException, FundAmountInvalidException, NotExistException, FieldMissingException, AlreadyExistException {
		UUID accountId = request.getAccountId();
		String fundCode = request.getFundCode();
		LocalDateTime date = request.getDate().atStartOfDay();
		BigDecimal share = request.getShare();
		BigDecimal price = request.getPrice();
		BigDecimal rate = request.getRate();
		BigDecimal payment = request.getPayment();
		BigDecimal fee = request.getFee();
		UUID fileId = request.getFileId();

		UUID userId = ContextUtil.getUserId();
		if (BigDecimal.ZERO.compareTo(share) >= 0) {
			throw new FundAmountInvalidException(share);
		}
		Account account = this.accountFacade.query(accountId);
		BigDecimal total = payment.add(fee);
		if (account.getBalance().compareTo(total) < 0) {
			throw new AccountBalanceNotEnoughException(account.getName());
		}

		UserFund entity = null;
		try {
			entity = this.userFundFacade.queryByUserIdAndFundCode(userId, fundCode);
		} catch (Exception e) {
		}
		if (BaseAppUtil.isPresent(entity)) {
			entity.setAmount(entity.getAmount().add(share));
			entity = this.userFundFacade.update(entity);
		} else {
			entity = new UserFund();
			entity.setUserId(userId);
			entity.setFundCode(fundCode);
			entity.setAmount(share);
			entity = this.userFundFacade.insert(entity);
		}

		account.setBalance(account.getBalance().subtract(total));
		account = this.accountFacade.update(account);

		AccountRecord accountRecord = new AccountRecord();
		accountRecord.setTransDate(date);
		accountRecord.setTransAmount(BigDecimal.ZERO.subtract(total));
		accountRecord.setTransFrom(account.getId());
		accountRecord.setTransTo(account.getId());
		accountRecord.setRecordType(RecordType.INVEST);
		accountRecord.setDescription(MessageFormat.format(MessageConstant.USER_FUND_BUY_SUCCESS, fundCode, share, price));
		accountRecord.setFileId(fileId);
		accountRecord = this.accountRecordFacade.insert(accountRecord);

		UserFundRecord record = new UserFundRecord();
		record.setUserFundId(entity.getId());
		record.setAccountId(account.getId());
		record.setType(DealType.BUY);
		record.setDate(date);
		record.setShare(share);
		record.setPrice(price);
		record.setRate(rate);
		record.setFee(fee);
		record.setTotal(total);
		record.setAccountRecordId(accountRecord.getId());
		record = this.userFundRecordFacade.insert(record);

		return entity;
	}

	@Transactional
	public UserFund sell(FundSellRequest request) throws FundAmountInvalidException, AlreadyExistException, FieldMissingException, NotExistException {
		UUID accountId = request.getAccountId();
		String fundCode = request.getFundCode();
		LocalDateTime date = request.getDate().atStartOfDay();
		BigDecimal share = request.getShare();
		BigDecimal price = request.getPrice();
		BigDecimal rate = request.getRate();
		BigDecimal total = request.getTotal();
		UUID fileId = request.getFileId();

		UUID userId = ContextUtil.getUserId();
		if (BigDecimal.ZERO.compareTo(share) >= 0) {
			throw new FundAmountInvalidException(share);
		}

		UserFund entity = this.userFundFacade.queryByUserIdAndFundCode(userId, fundCode);
		if (entity.getAmount().compareTo(share) < 0) {
			throw new FundAmountInvalidException(share);
		}
		entity.setAmount(entity.getAmount().subtract(share));
		entity = this.userFundFacade.update(entity);

		Account account = this.accountFacade.query(accountId);
		account.setBalance(account.getBalance().add(total));
		account = this.accountFacade.update(account);

		AccountRecord accountRecord = new AccountRecord();
		accountRecord.setTransDate(date);
		accountRecord.setTransAmount(total);
		accountRecord.setTransFrom(account.getId());
		accountRecord.setTransTo(account.getId());
		accountRecord.setRecordType(RecordType.INVEST);
		accountRecord.setDescription(MessageFormat.format(MessageConstant.USER_FUND_SELL_SUCCESS, fundCode, share, price));
		accountRecord.setFileId(fileId);
		accountRecord = this.accountRecordFacade.insert(accountRecord);

		UserFundRecord record = new UserFundRecord();
		record.setUserFundId(entity.getId());
		record.setAccountId(account.getId());
		record.setType(DealType.SELL);
		record.setDate(date);
		record.setShare(share);
		record.setPrice(price);
		record.setRate(rate);
		record.setFee(BigDecimal.ZERO);
		record.setTotal(total);
		record.setAccountRecordId(accountRecord.getId());
		record = this.userFundRecordFacade.insert(record);

		return entity;
	}

	@Transactional
	public UserFund bonus(FundBonusRequest request) throws FundAmountInvalidException, AlreadyExistException, FieldMissingException, NotExistException {
		UUID accountId = request.getAccountId();
		String fundCode = request.getFundCode();
		LocalDateTime date = request.getDate().atStartOfDay();
		BigDecimal share = request.getShare();
		BigDecimal price = request.getPrice();
		BigDecimal rate = request.getRate();
		BigDecimal total = request.getTotal();
		UUID fileId = request.getFileId();

		UUID userId = ContextUtil.getUserId();
		if (BigDecimal.ZERO.compareTo(share) >= 0) {
			throw new FundAmountInvalidException(share);
		}

		UserFund entity = this.userFundFacade.queryByUserIdAndFundCode(userId, fundCode);

		Account account = this.accountFacade.query(accountId);
		account.setBalance(account.getBalance().add(total));
		account = this.accountFacade.update(account);

		AccountRecord accountRecord = new AccountRecord();
		accountRecord.setTransDate(date);
		accountRecord.setTransAmount(total);
		accountRecord.setTransFrom(account.getId());
		accountRecord.setTransTo(account.getId());
		accountRecord.setRecordType(RecordType.INVEST);
		accountRecord.setDescription(MessageFormat.format(MessageConstant.USER_FUND_BONUS_SUCCESS, total, fundCode));
		accountRecord.setFileId(fileId);
		accountRecord = this.accountRecordFacade.insert(accountRecord);

		UserFundRecord record = new UserFundRecord();
		record.setUserFundId(entity.getId());
		record.setAccountId(account.getId());
		record.setType(DealType.BONUS);
		record.setDate(date);
		record.setShare(share);
		record.setPrice(price);
		record.setRate(rate);
		record.setFee(BigDecimal.ZERO);
		record.setTotal(total);
		record.setAccountRecordId(accountRecord.getId());
		record = this.userFundRecordFacade.insert(record);

		return entity;
	}

	@Transactional
	public UserFund updateRecord(FundTradeRecordEditRequest request) throws StockAmountInvalidException, NotExistException, FieldMissingException {
		UUID recordId = request.getRecordId();
		UUID accountId = request.getAccountId();
		String fundCode = request.getFundCode();
		LocalDateTime date = request.getDate().atStartOfDay();
		BigDecimal share = request.getShare();
		BigDecimal price = request.getPrice();
		BigDecimal rate = request.getRate();
		BigDecimal fee = request.getFee();
		BigDecimal total = request.getTotal();
		UUID fileId = request.getFileId();
		UUID accountRecordId = request.getAccountRecordId();
		UUID userId = ContextUtil.getUserId();

		if (BigDecimal.ZERO.compareTo(share) >= 0) {
			throw new StockAmountInvalidException(share);
		}

		UserFundRecord tradeRecord = this.userFundRecordFacade.query(recordId);
		if (BaseAppUtil.isEmpty(tradeRecord)) {
			throw new NotExistException();
		}
		// handle origin account record and user stock record
		{
			UserFund userFund = this.userFundFacade.query(tradeRecord.getUserFundId());
			if (tradeRecord.getType() == DealType.BUY) {
				userFund.setAmount(userFund.getAmount().subtract(tradeRecord.getShare()));
			} else if (tradeRecord.getType() == DealType.SELL) {
				userFund.setAmount(userFund.getAmount().add(tradeRecord.getShare()));
			}
			userFund = this.userFundFacade.update(userFund);

			Account account = this.accountFacade.query(tradeRecord.getAccountId());
			AccountRecord accountRecord = this.accountRecordFacade.query(tradeRecord.getAccountRecordId());
			account.setBalance(account.getBalance().subtract(accountRecord.getTransAmount()));
			account = this.accountFacade.update(account);
		}

		UserFund userFund = this.userFundFacade.queryByUserIdAndFundCode(userId, fundCode);
		if (tradeRecord.getType() == DealType.BUY) {
			userFund.setAmount(userFund.getAmount().add(share));
		} else if (tradeRecord.getType() == DealType.SELL) {
			userFund.setAmount(userFund.getAmount().subtract(share));
		}
		userFund = this.userFundFacade.update(userFund);

		Account account = this.accountFacade.query(accountId);
		if (tradeRecord.getType() == DealType.BUY) {
			account.setBalance(account.getBalance().subtract(total));
		} else if (tradeRecord.getType() == DealType.SELL || tradeRecord.getType() == DealType.BONUS) {
			account.setBalance(account.getBalance().add(total));
		}
		account = this.accountFacade.update(account);

		AccountRecord accountRecord = this.accountRecordFacade.query(accountRecordId);
		if (tradeRecord.getType() == DealType.BUY) {
			accountRecord.setDescription(MessageFormat.format(MessageConstant.USER_FUND_BUY_SUCCESS, fundCode, share, price));
			accountRecord.setTransAmount(BigDecimal.ZERO.subtract(total));
		} else if (tradeRecord.getType() == DealType.SELL) {
			accountRecord.setDescription(MessageFormat.format(MessageConstant.USER_FUND_SELL_SUCCESS, fundCode, share, price));
			accountRecord.setTransAmount(total);
		} else if (tradeRecord.getType() == DealType.BONUS) {
			accountRecord.setDescription(MessageFormat.format(MessageConstant.USER_FUND_BONUS_SUCCESS, total, fundCode));
			accountRecord.setTransAmount(total);
		}
		accountRecord.setTransFrom(accountId);
		accountRecord.setTransTo(accountId);
		accountRecord.setTransDate(date);
		accountRecord.setFileId(fileId);
		accountRecord = this.accountRecordFacade.update(accountRecord);

		tradeRecord.setAccountId(accountId);
		tradeRecord.setUserFundId(userFund.getId());
		tradeRecord.setDate(date);
		tradeRecord.setShare(share);
		tradeRecord.setPrice(price);
		tradeRecord.setRate(rate);
		tradeRecord.setFee(fee);
		tradeRecord.setTotal(total);
		tradeRecord = this.userFundRecordFacade.update(tradeRecord);

		return userFund;
	}

	@Transactional
	public void reverseRecord(UUID recordId) throws NotExistException, FieldMissingException {
		UserFundRecord userFundRecord = this.userFundRecordFacade.query(recordId);

		if (BaseAppUtil.isEmpty(userFundRecord)) {
			throw new NotExistException();
		}

		this.userFundRecordFacade.delete(recordId);

		UserFund userFund = this.userFundFacade.query(userFundRecord.getUserFundId());
		if (userFundRecord.getType() == DealType.BUY) {
			userFund.setAmount(userFund.getAmount().subtract(userFundRecord.getShare()));
		} else if (userFundRecord.getType() == DealType.SELL) {
			userFund.setAmount(userFund.getAmount().add(userFundRecord.getShare()));
		}

		Account account = this.accountFacade.query(userFundRecord.getAccountId());
		AccountRecord accountRecord = this.accountRecordFacade.query(userFundRecord.getAccountRecordId());
		account.setBalance(account.getBalance().subtract(accountRecord.getTransAmount()));
		this.accountFacade.update(account);
		this.accountRecordFacade.delete(accountRecord.getId());
	}

	public List<UserTrackingFundVo> getUserTrackingFundList() {
		UUID userId = ContextUtil.getUserId();
		String cacheKey = MessageFormat.format(CodeConstant.USER_TRACKING_FUND_KEY, userId);
		List<UserTrackingFund> trackingList = this.userCache.opsForValue().get(cacheKey);
		if (BaseAppUtil.isEmpty(trackingList)) {
			trackingList = this.userTrackingFundFacade.queryAll(userId);
			this.userCache.opsForValue().set(cacheKey, trackingList);
		}

		List<UserTrackingFundVo> list = new ArrayList<UserTrackingFundVo>();
		for (UserTrackingFund x : trackingList) {
			UserTrackingFundVo vo = new UserTrackingFundVo();
			vo.transform(x);

			Fund info = this.fundFacade.query(x.getFundCode());
			vo.setFundName(info.getName());

			List<FundRecord> records = this.fundRecordFacade.queryAll(x.getFundCode());
			if (records.size() > 0) {
				FundRecord r0 = records.get(records.size() - 1);
				vo.setRecord(r0);
				if (records.size() > 1) {
					FundRecord r1 = records.get(records.size() - 2);
					vo.setAmplitude(r0.getPrice().subtract(r1.getPrice()));
				}
			}
			list.add(vo);
		}
		return list;
	}

	public void track(String fundCode) throws AlreadyExistException, FieldMissingException {
		UUID userId = ContextUtil.getUserId();
		UserTrackingFund entity = new UserTrackingFund();
		entity.setUserId(userId);
		entity.setFundCode(fundCode);
		this.userTrackingFundFacade.insert(entity);
		this.syncTrackingCache(userId);
	}

	public void untrack(String fundCode) throws NotExistException {
		UUID userId = ContextUtil.getUserId();
		UserTrackingFund entity = this.userTrackingFundFacade.query(userId, fundCode);
		this.userTrackingFundFacade.delete(entity.getId());
		this.syncTrackingCache(userId);
	}

	private void syncTrackingCache(UUID userId) {
		String cacheKey = MessageFormat.format(CodeConstant.USER_TRACKING_FUND_KEY, userId);
		List<UserTrackingFund> trackingList = this.userTrackingFundFacade.queryAll(userId);
		this.userCache.opsForValue().set(cacheKey, trackingList);
	}
}
