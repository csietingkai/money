package io.tingkai.money.service;

import java.math.BigDecimal;
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
import io.tingkai.money.entity.Fund;
import io.tingkai.money.entity.FundRecord;
import io.tingkai.money.entity.UserFund;
import io.tingkai.money.entity.UserFundRecord;
import io.tingkai.money.entity.UserTrackingFund;
import io.tingkai.money.enumeration.DealType;
import io.tingkai.money.facade.AccountFacade;
import io.tingkai.money.facade.AccountRecordFacade;
import io.tingkai.money.facade.FundFacade;
import io.tingkai.money.facade.FundRecordFacade;
import io.tingkai.money.facade.UserFundFacade;
import io.tingkai.money.facade.UserFundRecordFacade;
import io.tingkai.money.facade.UserTrackingFundFacade;
import io.tingkai.money.logging.Loggable;
import io.tingkai.money.model.exception.AccountBalanceNotEnoughException;
import io.tingkai.money.model.exception.AlreadyExistException;
import io.tingkai.money.model.exception.FieldMissingException;
import io.tingkai.money.model.exception.FundAmountInvalidException;
import io.tingkai.money.model.exception.NotExistException;
import io.tingkai.money.model.vo.UserFundVo;
import io.tingkai.money.model.vo.UserTrackingFundVo;
import io.tingkai.money.util.AppUtil;

@Service
@Loggable
public class UserFundService {

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
	@Qualifier(CodeConstants.USER_CACHE)
	private RedisTemplate<String, List<UserTrackingFund>> userCache;

	public List<UserFundVo> getAll(String username) {
		return getAll(username, true);
	}

	public List<UserFundVo> getAll(String username, boolean onlyShowHave) {
		List<UserFund> entities = this.userFundFacade.queryByUsername(username);
		if (onlyShowHave) {
			entities = entities.stream().filter(x -> BigDecimal.ZERO.compareTo(x.getAmount()) < 0).collect(Collectors.toList());
		}
		Map<String, String> fundNames = this.fundFacade.queryAll().stream().collect(Collectors.toMap(Fund::getCode, Fund::getName));
		List<UserFundVo> vos = new ArrayList<UserFundVo>();
		entities.forEach(e -> {
			UserFundVo vo = new UserFundVo();
			vo.transform(e);
			vo.setFundName(fundNames.getOrDefault(vo.getFundCode(), CodeConstants.EMPTY_STRING));
			FundRecord fundRecord = this.fundRecordFacade.latestRecord(vo.getFundCode());
			vo.setPrice(fundRecord.getPrice());
			vo.setPriceDate(fundRecord.getDate());
			vos.add(vo);
		});
		return vos;
	}

	public UserFund buy(String username, UUID accountId, String fundCode, LocalDateTime date, BigDecimal share, BigDecimal price, BigDecimal rate, BigDecimal payment, BigDecimal fee) throws AccountBalanceNotEnoughException, FundAmountInvalidException, NotExistException, FieldMissingException, AlreadyExistException {
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
			entity = this.userFundFacade.queryByUsernameAndFundCode(username, fundCode);
		} catch (Exception e) {
		}
		if (AppUtil.isPresent(entity)) {
			entity.setAmount(entity.getAmount().add(share));
			entity = this.userFundFacade.update(entity);
		} else {
			entity = new UserFund();
			entity.setUserName(username);
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
		accountRecord.setDescription(MessageFormat.format(MessageConstant.ACCOUNT_EXPEND_DESC, account.getName(), MessageFormat.format(MessageConstant.USER_FUND_BUY_SUCCESS, username, fundCode, share, price)));
		this.accountRecordFacade.insert(accountRecord);

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
		record = this.userFundRecordFacade.insert(record);

		return entity;
	}

	public UserFund sell(String username, UUID accountId, String fundCode, LocalDateTime date, BigDecimal share, BigDecimal price, BigDecimal rate, BigDecimal priceFix) throws FundAmountInvalidException, AlreadyExistException, FieldMissingException, NotExistException {
		if (BigDecimal.ZERO.compareTo(share) >= 0) {
			throw new FundAmountInvalidException(share);
		}

		UserFund entity = this.userFundFacade.queryByUsernameAndFundCode(username, fundCode);
		if (entity.getAmount().compareTo(share) < 0) {
			throw new FundAmountInvalidException(share);
		}
		entity.setAmount(entity.getAmount().subtract(share));
		entity = this.userFundFacade.update(entity);

		Account account = this.accountFacade.query(accountId);
		BigDecimal total = share.multiply(price).add(priceFix);
		account.setBalance(account.getBalance().add(total));
		account = this.accountFacade.update(account);

		AccountRecord accountRecord = new AccountRecord();
		accountRecord.setTransDate(date);
		accountRecord.setTransAmount(total);
		accountRecord.setTransFrom(account.getId());
		accountRecord.setTransTo(account.getId());
		accountRecord.setDescription(MessageFormat.format(MessageConstant.ACCOUNT_EXPEND_DESC, account.getName(), MessageFormat.format(MessageConstant.USER_FUND_SELL_SUCCESS, username, fundCode, share, price)));
		this.accountRecordFacade.insert(accountRecord);

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
		record = this.userFundRecordFacade.insert(record);

		return entity;
	}

	public List<UserTrackingFundVo> getUserTrackingFundList(String username) {
		String cacheKey = MessageFormat.format(CodeConstants.USER_TRACKING_FUND_KEY, username);
		List<UserTrackingFund> trackingList = this.userCache.opsForValue().get(cacheKey);
		if (AppUtil.isEmpty(trackingList)) {
			trackingList = this.userTrackingFundFacade.queryAll(username);
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

	public void track(String username, String fundCode) throws AlreadyExistException, FieldMissingException {
		UserTrackingFund entity = new UserTrackingFund();
		entity.setUserName(username);
		entity.setFundCode(fundCode);
		this.userTrackingFundFacade.insert(entity);
		this.syncTrackingCache(username);
	}

	public void untrack(String username, String fundCode) throws NotExistException {
		UserTrackingFund entity = this.userTrackingFundFacade.query(username, fundCode);
		this.userTrackingFundFacade.delete(entity.getId());
		this.syncTrackingCache(username);
	}

	private void syncTrackingCache(String username) {
		String cacheKey = MessageFormat.format(CodeConstants.USER_TRACKING_FUND_KEY, username);
		List<UserTrackingFund> trackingList = this.userTrackingFundFacade.queryAll(username);
		this.userCache.opsForValue().set(cacheKey, trackingList);
	}
}
