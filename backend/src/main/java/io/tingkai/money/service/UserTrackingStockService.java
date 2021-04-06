package io.tingkai.money.service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import io.tingkai.money.constant.CodeConstants;
import io.tingkai.money.dao.UserTrackingStockDao;
import io.tingkai.money.entity.UserTrackingStock;
import io.tingkai.money.util.AppUtil;

@Service
public class UserTrackingStockService {

	@Autowired
	private UserTrackingStockDao userTrackingStockDao;

	@Autowired
	@Qualifier(CodeConstants.USER_CACHE)
	private RedisTemplate<String, List<UserTrackingStock>> userCache;

	public List<UserTrackingStock> getUserTrackingStockList(String username) {
		String cacheKey = CodeConstants.USER_TRACKING_STOCK_KEY + username;
		List<UserTrackingStock> trackingList = this.userCache.opsForValue().get(cacheKey);
		if (AppUtil.isEmpty(trackingList)) {
			trackingList = new ArrayList<UserTrackingStock>();
			Iterable<UserTrackingStock> iterable = this.userTrackingStockDao.findByUserNameOrderByStockCode(username);
			iterable.forEach(trackingList::add);
			this.userCache.opsForValue().set(cacheKey, trackingList);
		}
		return trackingList;
	}

	public void track(String username, String stockCode) {
		UserTrackingStock entity = new UserTrackingStock();
		entity.setUserName(username);
		entity.setStockCode(stockCode);
		this.userTrackingStockDao.save(entity);
		this.syncTrackingCache(username);
	}

	public void cancelTrack(String username, String stockCode) {
		UserTrackingStock entity = new UserTrackingStock();
		entity.setUserName(username);
		entity.setStockCode(stockCode);
		Optional<UserTrackingStock> optional = this.userTrackingStockDao.findByUserNameAndStockCode(username, stockCode);
		if (optional.isPresent()) {
			this.userTrackingStockDao.delete(optional.get());
			this.syncTrackingCache(username);
		}
	}

	private void syncTrackingCache(String username) {
		String cacheKey = CodeConstants.USER_TRACKING_STOCK_KEY + username;
		List<UserTrackingStock> trackingList = new ArrayList<UserTrackingStock>();
		Iterable<UserTrackingStock> iterable = this.userTrackingStockDao.findByUserNameOrderByStockCode(username);
		iterable.forEach(trackingList::add);
		this.userCache.opsForValue().set(cacheKey, trackingList);
	}
}
