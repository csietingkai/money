package io.tingkai.money;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

import io.tingkai.money.constant.AppConstants;
import io.tingkai.money.entity.Option;
import io.tingkai.money.enumeration.option.FinancialFileType;
import io.tingkai.money.enumeration.option.RecordType;
import io.tingkai.money.enumeration.option.StockType;
import io.tingkai.money.facade.OptionFacade;
import io.tingkai.money.model.exception.AlreadyExistException;
import io.tingkai.money.model.exception.FieldMissingException;
import io.tingkai.money.service.OptionService;
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
	private OptionFacade optionFacade;

	@EventListener(ApplicationReadyEvent.class)
	public void onStarted() throws AlreadyExistException, FieldMissingException {
		this.addRoot();
		this.initOptions();
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

	private void initOptions() throws FieldMissingException, AlreadyExistException {
		if (this.optionFacade.count() == 0L) {
			this.optionFacade.insert(new Option(OptionService.FILE_TYPE, FinancialFileType.STOCK, "Stock", "股票"));
			this.optionFacade.insert(new Option(OptionService.FILE_TYPE, FinancialFileType.FUND, "Fund", "基金"));
			this.optionFacade.insert(new Option(OptionService.FILE_TYPE, FinancialFileType.CREDIT_CARD, "Credit Card", "信用卡"));
			this.optionFacade.insert(new Option(OptionService.FILE_TYPE, FinancialFileType.PASSBOOK, "Passbook", "存摺"));
			this.optionFacade.insert(new Option(OptionService.FILE_TYPE, FinancialFileType.SALARY_SLIP, "Salary Slip", "薪資條"));
			this.optionFacade.insert(new Option(OptionService.FILE_TYPE, FinancialFileType.OTHER, "Other", "其他"));

			this.optionFacade.insert(new Option(OptionService.STOCK_TYPE, StockType.TW, "TW", "TW"));
			this.optionFacade.insert(new Option(OptionService.STOCK_TYPE, StockType.US, "US", "US"));

			this.optionFacade.insert(new Option(OptionService.RECORD_TYPE, RecordType.SALARY, "Salary", "薪資"));
			this.optionFacade.insert(new Option(OptionService.RECORD_TYPE, RecordType.BONUS, "Bonus", "獎金"));
			this.optionFacade.insert(new Option(OptionService.RECORD_TYPE, RecordType.FOOD, "Food", "食物"));
			this.optionFacade.insert(new Option(OptionService.RECORD_TYPE, RecordType.LIFE, "Life", "生活費"));
			this.optionFacade.insert(new Option(OptionService.RECORD_TYPE, RecordType.SPORT, "Sport", "運動"));
			this.optionFacade.insert(new Option(OptionService.RECORD_TYPE, RecordType.INVEST, "Investment", "投資"));
			this.optionFacade.insert(new Option(OptionService.RECORD_TYPE, RecordType.TRANSPORTATION, "Transportation", "交通"));
			this.optionFacade.insert(new Option(OptionService.RECORD_TYPE, RecordType.CREDIT_CARD, "Credit Card", "信用卡費"));
			this.optionFacade.insert(new Option(OptionService.RECORD_TYPE, RecordType.MEDIC, "Medic", "醫療"));
			this.optionFacade.insert(new Option(OptionService.RECORD_TYPE, RecordType.FEE, "Fee", "手續費"));
			this.optionFacade.insert(new Option(OptionService.RECORD_TYPE, RecordType.DONATE, "Donate", "抖內"));
			this.optionFacade.insert(new Option(OptionService.RECORD_TYPE, RecordType.OTHER, "Other", "其他"));
		}
	}
}
