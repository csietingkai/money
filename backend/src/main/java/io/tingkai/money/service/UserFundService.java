package io.tingkai.money.service;

import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import io.tingkai.money.constant.CodeConstants;
import io.tingkai.money.entity.Fund;
import io.tingkai.money.entity.FundRecord;
import io.tingkai.money.entity.UserTrackingFund;
import io.tingkai.money.facade.FundFacade;
import io.tingkai.money.facade.FundRecordFacade;
import io.tingkai.money.facade.UserTrackingFundFacade;
import io.tingkai.money.logging.Loggable;
import io.tingkai.money.model.exception.AlreadyExistException;
import io.tingkai.money.model.exception.FieldMissingException;
import io.tingkai.money.model.exception.NotExistException;
import io.tingkai.money.model.vo.UserTrackingFundVo;
import io.tingkai.money.util.AppUtil;

@Service
@Loggable
public class UserFundService {

//	@Autowired
//	private AccountFacade accountFacade;

	@Autowired
	private FundFacade fundFacade;

	@Autowired
	private FundRecordFacade fundRecordFacade;

	@Autowired
	private UserTrackingFundFacade userTrackingFundFacade;

	@Autowired
	@Qualifier(CodeConstants.USER_CACHE)
	private RedisTemplate<String, List<UserTrackingFund>> userCache;

	public List<UserTrackingFundVo> getUserTrackingStockList(String username) {
		String cacheKey = CodeConstants.USER_TRACKING_FUND_KEY + username;
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
		String cacheKey = CodeConstants.USER_TRACKING_FUND_KEY + username;
		List<UserTrackingFund> trackingList = this.userTrackingFundFacade.queryAll(username);
		this.userCache.opsForValue().set(cacheKey, trackingList);
	}
}
