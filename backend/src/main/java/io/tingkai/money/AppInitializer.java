package io.tingkai.money;

import java.time.LocalDateTime;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Component;

import io.tingkai.money.constant.AppConstants;
import io.tingkai.money.constant.CodeConstants;
import io.tingkai.money.service.PythonFetcherService;
import io.tingkai.money.service.UserService;
import io.tingkai.money.util.AppUtil;
import io.tingkai.money.util.StringUtil;
import io.tingkai.money.util.TimeUtil;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
public class AppInitializer {

	@Autowired
	private UserService userService;

	@Autowired
	private PythonFetcherService pythonFetcher;

	@Autowired
	@Qualifier(CodeConstants.PYTHON_CACHE)
	private RedisTemplate<String, Long> pythonCache;

	@EventListener(ApplicationReadyEvent.class)
	public void onStarted() {
		this.addRoot();
		this.fetchExchangeRate();
		this.fetchStock();
	}

	private void addRoot() {
		if (!this.userService.isRootExist()) {
			String initRootPassword = AppConstants.INIT_ROOT_PASSWORD;
			if (AppUtil.isEmpty(initRootPassword) && !StringUtil.isBlank(initRootPassword)) {
				initRootPassword = StringUtil.generateRandom(AppConstants.INIT_ROOT_PASSWORD_LENGTH);
			}
			log.info("Root Init Password is: " + initRootPassword);
			this.userService.createRoot(initRootPassword);
		}
	}

	private void fetchExchangeRate() {
		Long lastUpdateTime = this.pythonCache.opsForValue().get(CodeConstants.CURRENCY_UPDATE_TIME_KEY);
		if (AppUtil.isEmpty(lastUpdateTime) || (!TimeUtil.isInOneDay(LocalDateTime.now(), TimeUtil.convertToDateTime(lastUpdateTime)) && LocalDateTime.now().isAfter(TimeUtil.convertToDateTime(lastUpdateTime)))) {
			this.pythonFetcher.fetchExchangeRate();
			this.pythonFetcher.fetechExchangeRateRecord();
			lastUpdateTime = TimeUtil.getCurrentDateTime();
			this.pythonCache.opsForValue().set(CodeConstants.CURRENCY_UPDATE_TIME_KEY, lastUpdateTime);
		}
		log.info("Fetch Exchange Rate Completed.");
	}

	private void fetchStock() {
		Long lastUpdateTime = this.pythonCache.opsForValue().get(CodeConstants.STOCK_UPDATE_TIME_KEY);
		if (AppUtil.isEmpty(lastUpdateTime) || (!TimeUtil.isInOneDay(LocalDateTime.now(), TimeUtil.convertToDateTime(lastUpdateTime)) && LocalDateTime.now().isAfter(TimeUtil.convertToDateTime(lastUpdateTime)))) {
			this.pythonFetcher.fetchStock();
			this.pythonFetcher.fetchStockRecord();
			lastUpdateTime = TimeUtil.getCurrentDateTime();
			this.pythonCache.opsForValue().set(CodeConstants.STOCK_UPDATE_TIME_KEY, lastUpdateTime);
		}
		log.info("Fetch Stock Completed.");
	}
}
