package io.tingkai.money;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

import io.tingkai.money.constant.AppConstants;
import io.tingkai.money.model.exception.AlreadyExistException;
import io.tingkai.money.model.exception.FieldMissingException;
import io.tingkai.money.service.DataFetcherService;
import io.tingkai.money.service.UserService;
import io.tingkai.money.util.AppUtil;
import io.tingkai.money.util.StringUtil;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
public class AppInitializer {

	@Autowired
	private UserService userService;

	@Autowired
	private DataFetcherService dataFetcherService;

	@EventListener(ApplicationReadyEvent.class)
	public void onStarted() throws AlreadyExistException, FieldMissingException {
		this.addRoot();
		this.dataFetcherService.fetchExchangeRate();
		log.info("Fetch Exchange Rate Completed.");
		this.dataFetcherService.fetchStocks();
		log.info("Fetch Stock Completed.");
		this.dataFetcherService.fetchFunds();
		log.info("Fetch Fund Completed.");
	}

	private void addRoot() throws AlreadyExistException, FieldMissingException {
		if (!this.userService.isRootExist()) {
			String initRootPassword = AppConstants.INIT_ROOT_PASSWORD;
			if (AppUtil.isEmpty(initRootPassword) && !StringUtil.isBlank(initRootPassword)) {
				initRootPassword = StringUtil.generateRandom(AppConstants.INIT_ROOT_PASSWORD_LENGTH);
			}
			log.info("Root Init Password is: " + initRootPassword);
			this.userService.createRoot(initRootPassword);
		}
	}
}
