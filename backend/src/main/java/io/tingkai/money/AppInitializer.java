package io.tingkai.money;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Component;

import io.tingkai.money.constant.AppConstants;
import io.tingkai.money.constant.CodeConstants;
import io.tingkai.money.model.exception.AlreadyExistException;
import io.tingkai.money.model.exception.FieldMissingException;
import io.tingkai.money.model.exception.QueryNotResultException;
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

	@Autowired
	@Qualifier(CodeConstants.PYTHON_CACHE)
	private RedisTemplate<String, Set<String>> skipStockCache;

	@EventListener(ApplicationReadyEvent.class)
	public void onStarted() throws QueryNotResultException, AlreadyExistException, FieldMissingException {
		this.addRoot();
		this.fetchExchangeRate();
		this.fetchStock();
	}

	private void addRoot() throws QueryNotResultException, AlreadyExistException, FieldMissingException {
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
		Long lastUpdateTime = this.pythonCache.opsForValue().get(CodeConstants.EXCHANGE_RATE_UPDATE_TIME_KEY);
		if (AppUtil.isEmpty(lastUpdateTime) || TimeUtil.diff(LocalDateTime.now(), TimeUtil.convertToDateTime(lastUpdateTime)) > CodeConstants.UPDATE_FREQUENCY_HOURS * TimeUtil.HOUR_MILISECS) {
			try {
				this.pythonFetcher.fetchExchangeRate();
			} catch (AlreadyExistException | FieldMissingException | QueryNotResultException e) {
				log.warn(e.getMessage());
			}
			lastUpdateTime = TimeUtil.getCurrentDateTime();
			this.pythonCache.opsForValue().set(CodeConstants.EXCHANGE_RATE_UPDATE_TIME_KEY, lastUpdateTime);
		}
		log.info("Fetch Exchange Rate Completed.");
	}

	private void fetchStock() {
		Set<String> skipList = this.skipStockCache.opsForValue().get(CodeConstants.STOCK_SKIP_FETCH_LIST_KEY);
		if (AppUtil.isEmpty(skipList)) {
			skipList = new HashSet<String>();
			this.skipStockCache.opsForValue().set(CodeConstants.STOCK_SKIP_FETCH_LIST_KEY, skipList);
		}

		Long lastUpdateTime = this.pythonCache.opsForValue().get(CodeConstants.STOCK_UPDATE_TIME_KEY);
		if (AppUtil.isEmpty(lastUpdateTime) || TimeUtil.diff(LocalDateTime.now(), TimeUtil.convertToDateTime(lastUpdateTime)) > CodeConstants.UPDATE_FREQUENCY_HOURS * TimeUtil.HOUR_MILISECS) {
			this.pythonFetcher.fetchStocks();
			lastUpdateTime = TimeUtil.getCurrentDateTime();
			this.pythonCache.opsForValue().set(CodeConstants.STOCK_UPDATE_TIME_KEY, lastUpdateTime);
		}
		log.info("Fetch Stock Completed.");
	}
}
