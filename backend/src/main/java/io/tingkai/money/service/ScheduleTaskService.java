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

import io.tingkai.money.constant.CodeConstants;
import io.tingkai.money.entity.ExchangeRate;
import io.tingkai.money.entity.ExchangeRateRecord;
import io.tingkai.money.entity.Fund;
import io.tingkai.money.entity.FundRecord;
import io.tingkai.money.entity.Stock;
import io.tingkai.money.entity.StockRecord;
import io.tingkai.money.enumeration.CompareResult;
import io.tingkai.money.facade.ExchangeRateFacade;
import io.tingkai.money.facade.ExchangeRateRecordFacade;
import io.tingkai.money.facade.FundFacade;
import io.tingkai.money.facade.FundRecordFacade;
import io.tingkai.money.facade.StockFacade;
import io.tingkai.money.facade.StockRecordFacade;
import io.tingkai.money.logging.Loggable;
import io.tingkai.money.util.AppUtil;
import io.tingkai.money.util.TimeUtil;
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
	@Qualifier(CodeConstants.PYTHON_CACHE)
	private RedisTemplate<String, String> pythonCache;

	@Scheduled(cron = "0 59 23 * * SUN", zone = "Asia/Taipei") // every sunday night
	public void fetchRecords() {
		LocalDateTime today = TimeUtil.convertToDateTime(TimeUtil.getCurrentDate());
		this.fetchExchangeRatesRecords(today);
		this.fetchStocksRecords(today);
		this.fetchFundsRecords(today);
	}

	private void fetchExchangeRatesRecords(LocalDateTime today) {
		String currency = pythonCache.opsForValue().get(CodeConstants.EXCHANGE_RATE_FETCHING_CURRENCY);
		if (AppUtil.isPresent(currency)) {
			log.debug(MessageFormat.format("Still fetching Exchange Rate<{0}>", currency));
			return;
		}

		List<ExchangeRate> exchangeRates = this.exchangeRateFacade.queryAll();
		for (ExchangeRate exchangeRate : exchangeRates) {
			ExchangeRateRecord lastRecord = this.exchangeRateRecordFacade.latestRecord(exchangeRate.getCurrency());
			if ((AppUtil.isPresent(lastRecord) && TimeUtil.compare(lastRecord.getDate(), today) != CompareResult.EQUAL) || AppUtil.isEmpty(lastRecord)) {
				log.info(MessageFormat.format("Fetching {0}<{1}> records", exchangeRate.getName(), exchangeRate.getCurrency()));
				pythonCache.opsForValue().set(CodeConstants.EXCHANGE_RATE_FETCHING_CURRENCY, exchangeRate.getCurrency());
				pythonFetcherService.fetechExchangeRateRecord(exchangeRate.getCurrency());
				try {
					TimeUnit.SECONDS.sleep(3);
				} catch (InterruptedException e) {
					log.warn(e.getMessage());
				}
			}
		}
		pythonCache.delete(CodeConstants.EXCHANGE_RATE_FETCHING_CURRENCY);
	}

	private void fetchStocksRecords(LocalDateTime today) {
		String fetchingCode = pythonCache.opsForValue().get(CodeConstants.STOCK_FETCHING_CODE);
		if (AppUtil.isPresent(fetchingCode)) {
			log.debug(MessageFormat.format("Still fetching Stock<{0}>", fetchingCode));
			return;
		}

		List<Stock> stocks = this.stockFacade.queryAll(true);
		for (Stock stock : stocks) {
			StockRecord lastRecord = this.stockRecordFacade.latestRecord(stock.getCode());
			if ((AppUtil.isPresent(lastRecord) && TimeUtil.compare(lastRecord.getDealDate(), today) != CompareResult.EQUAL) || AppUtil.isEmpty(lastRecord)) {
				log.info(MessageFormat.format("Fetching {0}<{1}> records", stock.getName(), stock.getCode()));
				pythonCache.opsForValue().set(CodeConstants.STOCK_FETCHING_CODE, stock.getCode());
				pythonFetcherService.fetchStockRecord(stock.getCode());
				try {
					TimeUnit.SECONDS.sleep(3);
				} catch (InterruptedException e) {
					log.warn(e.getMessage());
				}
			}
		}
		pythonCache.delete(CodeConstants.STOCK_FETCHING_CODE);
	}

	private void fetchFundsRecords(LocalDateTime today) {
		String fetchingCode = pythonCache.opsForValue().get(CodeConstants.FUND_FETCHING_CODE);
		if (AppUtil.isPresent(fetchingCode)) {
			log.debug(MessageFormat.format("Still fetching Fund<{0}>", fetchingCode));
			return;
		}

		List<Fund> funds = this.fundFacade.queryAll(true);
		for (Fund fund : funds) {
			FundRecord lastRecord = this.fundRecordFacade.latestRecord(fund.getCode());
			if ((AppUtil.isPresent(lastRecord) && TimeUtil.compare(lastRecord.getDate(), today) != CompareResult.EQUAL) || AppUtil.isEmpty(lastRecord)) {
				log.info(MessageFormat.format("Fetching {0}<{1}> records", fund.getName(), fund.getCode()));
				pythonCache.opsForValue().set(CodeConstants.FUND_FETCHING_CODE, fund.getCode());
				pythonFetcherService.fetchFundRecord(fund.getCode());
				try {
					TimeUnit.SECONDS.sleep(3);
				} catch (InterruptedException e) {
					log.warn(e.getMessage());
				}
			}
		}
		pythonCache.delete(CodeConstants.FUND_FETCHING_CODE);
	}
}
