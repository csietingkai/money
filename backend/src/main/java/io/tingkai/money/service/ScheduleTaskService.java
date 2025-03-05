package io.tingkai.money.service;

import java.text.MessageFormat;
import java.time.LocalDateTime;
import java.util.List;
import java.util.concurrent.TimeUnit;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import io.tingkai.base.log.Loggable;
import io.tingkai.base.util.BaseAppUtil;
import io.tingkai.base.util.BaseStringUtil;
import io.tingkai.money.constant.CodeConstant;
import io.tingkai.money.entity.ExchangeRate;
import io.tingkai.money.entity.ExchangeRateRecord;
import io.tingkai.money.entity.Fund;
import io.tingkai.money.entity.FundRecord;
import io.tingkai.money.entity.Stock;
import io.tingkai.money.entity.StockRecord;
import io.tingkai.money.facade.ExchangeRateFacade;
import io.tingkai.money.facade.ExchangeRateRecordFacade;
import io.tingkai.money.facade.FundFacade;
import io.tingkai.money.facade.FundRecordFacade;
import io.tingkai.money.facade.StockFacade;
import io.tingkai.money.facade.StockRecordFacade;
import lombok.extern.slf4j.Slf4j;

@Component
@Loggable
@Slf4j
public class ScheduleTaskService {

	@Autowired
	private ExchangeRateFacade exchangeRateFacade;

	@Autowired
	private ExchangeRateRecordFacade exchangeRateRecordFacade;

	@Autowired
	private StockFacade stockFacade;

	@Autowired
	private StockRecordFacade stockRecordFacade;

	@Autowired
	private FundFacade fundFacade;

	@Autowired
	private FundRecordFacade fundRecordFacade;

	@Autowired
	private DataFetcherService pythonFetcherService;

	@Autowired
	@Qualifier(CodeConstant.PYTHON_CACHE)
	private RedisTemplate<String, String> pythonCache;

	@Scheduled(cron = "0 59 23 * * *")
	public void fetchRecords() {
		LocalDateTime today = LocalDateTime.now();
		this.fetchExchangeRatesRecords(today);
		this.fetchStocksRecords(today);
		this.fetchFundsRecords(today);
	}

	private void fetchExchangeRatesRecords(LocalDateTime today) {
		String currency = pythonCache.opsForValue().get(CodeConstant.EXCHANGE_RATE_FETCHING_CURRENCY);
		if (BaseAppUtil.isPresent(currency)) {
			log.debug(MessageFormat.format("Still fetching Exchange Rate<{0}>", currency));
			return;
		}

		List<ExchangeRate> exchangeRates = this.exchangeRateFacade.queryAll();
		for (ExchangeRate exchangeRate : exchangeRates) {
			if (BaseStringUtil.equals("TWD", exchangeRate.getCurrency())) {
				continue;
			}
			ExchangeRateRecord lastRecord = this.exchangeRateRecordFacade.latestRecord(exchangeRate.getCurrency());
			if ((BaseAppUtil.isPresent(lastRecord) && !today.toLocalDate().isEqual(lastRecord.getDate().toLocalDate())) || BaseAppUtil.isEmpty(lastRecord)) {
				log.info(MessageFormat.format("Fetching {0}<{1}> records", exchangeRate.getName(), exchangeRate.getCurrency()));
				pythonCache.opsForValue().set(CodeConstant.EXCHANGE_RATE_FETCHING_CURRENCY, exchangeRate.getCurrency());
				pythonFetcherService.fetechExchangeRateRecord(exchangeRate.getCurrency());
				try {
					TimeUnit.SECONDS.sleep(3);
				} catch (InterruptedException e) {
					log.warn(e.getMessage());
				}
			}
		}
		pythonCache.delete(CodeConstant.EXCHANGE_RATE_FETCHING_CURRENCY);
	}

	private void fetchStocksRecords(LocalDateTime today) {
		String fetchingCode = pythonCache.opsForValue().get(CodeConstant.STOCK_FETCHING_CODE);
		if (BaseAppUtil.isPresent(fetchingCode)) {
			log.debug(MessageFormat.format("Still fetching Stock<{0}>", fetchingCode));
			return;
		}

		List<Stock> stocks = this.stockFacade.queryByUserStockExist();
		for (Stock stock : stocks) {
			StockRecord lastRecord = this.stockRecordFacade.latestRecord(stock.getCode());
			if ((BaseAppUtil.isPresent(lastRecord) && !today.toLocalDate().isEqual(lastRecord.getDealDate().toLocalDate())) || BaseAppUtil.isEmpty(lastRecord)) {
				log.info(MessageFormat.format("Fetching {0}<{1}> records", stock.getName(), stock.getCode()));
				pythonCache.opsForValue().set(CodeConstant.STOCK_FETCHING_CODE, stock.getCode());
				pythonFetcherService.fetchStockRecord(stock.getCode());
				try {
					TimeUnit.SECONDS.sleep(3);
				} catch (InterruptedException e) {
					log.warn(e.getMessage());
				}
			}
		}
		pythonCache.delete(CodeConstant.STOCK_FETCHING_CODE);
	}

	private void fetchFundsRecords(LocalDateTime today) {
		String fetchingCode = pythonCache.opsForValue().get(CodeConstant.FUND_FETCHING_CODE);
		if (BaseAppUtil.isPresent(fetchingCode)) {
			log.debug(MessageFormat.format("Still fetching Fund<{0}>", fetchingCode));
			return;
		}

		List<Fund> funds = this.fundFacade.queryByUserFundExist(true);
		for (Fund fund : funds) {
			FundRecord lastRecord = this.fundRecordFacade.latestRecord(fund.getCode());
			if ((BaseAppUtil.isPresent(lastRecord) && !today.toLocalDate().isEqual(lastRecord.getDate().toLocalDate())) || BaseAppUtil.isEmpty(lastRecord)) {
				log.info(MessageFormat.format("Fetching {0}<{1}> records", fund.getName(), fund.getCode()));
				pythonCache.opsForValue().set(CodeConstant.FUND_FETCHING_CODE, fund.getCode());
				pythonFetcherService.fetchFundRecord(fund.getCode());
				try {
					TimeUnit.SECONDS.sleep(3);
				} catch (InterruptedException e) {
					log.warn(e.getMessage());
				}
			}
		}
		pythonCache.delete(CodeConstant.FUND_FETCHING_CODE);
	}
}
