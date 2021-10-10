package io.tingkai.money.service;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import io.tingkai.money.constant.AppConstants;
import io.tingkai.money.constant.CodeConstants;
import io.tingkai.money.constant.MessageConstant;
import io.tingkai.money.entity.ExchangeRate;
import io.tingkai.money.enumeration.MarketType;
import io.tingkai.money.facade.ExchangeRateFacade;
import io.tingkai.money.facade.FundFacade;
import io.tingkai.money.facade.StockFacade;
import io.tingkai.money.logging.Loggable;
import io.tingkai.money.model.exception.AlreadyExistException;
import io.tingkai.money.model.exception.FieldMissingException;
import io.tingkai.money.model.exception.QueryNotResultException;
import io.tingkai.money.util.AppUtil;
import lombok.extern.slf4j.Slf4j;

@Service
@Loggable
@Slf4j
public class DataFetcherService {

	private static final String PYTHON_FETCH_PATH_PREFIX = "/fetch";
	private static final String PYTHON_FETCH_EXCHANGE_RATES_PATH = PYTHON_FETCH_PATH_PREFIX + "/exchangeRates";
	private static final String PYTHON_FETCH_EXCHANGE_RATE_RECORDS_PATH = PYTHON_FETCH_PATH_PREFIX + "/exchangeRateRecords";
	private static final String PYTHON_FETCH_STOCKS_PATH = PYTHON_FETCH_PATH_PREFIX + "/stocks";
	private static final String PYTHON_FETCH_STOCK_PATH = PYTHON_FETCH_PATH_PREFIX + "/stock";
	private static final String PYTHON_FETCH_STOCK_RECORDS_PATH = PYTHON_FETCH_PATH_PREFIX + "/stockRecords";
	private static final String PYTHON_FETCH_FUNDS_PATH = PYTHON_FETCH_PATH_PREFIX + "/funds";
	private static final String PYTHON_FETCH_FUND_PATH = PYTHON_FETCH_PATH_PREFIX + "/fund";
	private static final String PYTHON_FETCH_FUND_RECORDS_PATH = PYTHON_FETCH_PATH_PREFIX + "/fundRecords";

	@Autowired
	private RestTemplate restTemplate;

	@Autowired
	@Qualifier(CodeConstants.PYTHON_CACHE)
	private RedisTemplate<String, List<ExchangeRate>> exchangeRateCache;

	/**
	 * save each currency update time
	 */
	@Autowired
	@Qualifier(CodeConstants.PYTHON_CACHE)
	private RedisTemplate<String, Map<String, Long>> exchangeRateRecordCache;

	@Autowired
	private ExchangeRateFacade exchangeRateFacade;

	@Autowired
	private StockFacade stockFacade;

	@Autowired
	private FundFacade fundFacade;

	public void fetchExchangeRate() throws AlreadyExistException, FieldMissingException, QueryNotResultException {
		long exchangeRateCount = this.exchangeRateFacade.count();
		if (exchangeRateCount == 0L) {
			String result = this.restTemplate.getForObject(AppConstants.PYTHON_BASE_URL + PYTHON_FETCH_EXCHANGE_RATES_PATH, String.class);
			if (!MessageConstant.SUCCESS.equals(result)) {
				log.warn(result);
			}
		}

		// sync cache
		List<ExchangeRate> cache = this.exchangeRateCache.opsForValue().get(CodeConstants.EXCHANGE_RATE_LIST_KEY);
		if (AppUtil.isEmpty(cache) || cache.size() != exchangeRateCount) {
			cache = this.exchangeRateFacade.queryAll();
			this.exchangeRateCache.opsForValue().set(CodeConstants.EXCHANGE_RATE_LIST_KEY, cache);
		}
	}

	public void fetechExchangeRateRecord(String currency) {
		// @formatter:off
		UriComponentsBuilder builder = UriComponentsBuilder
				.fromHttpUrl(AppConstants.PYTHON_BASE_URL + PYTHON_FETCH_EXCHANGE_RATE_RECORDS_PATH)
				.queryParam("currency", currency);
		// @formatter:on
		String result = this.restTemplate.getForObject(builder.toUriString(), String.class);
		if (!MessageConstant.SUCCESS.equals(result)) {
			log.warn(result);
		}
	}

	public void fetchStocks() throws FieldMissingException {
		for (MarketType marketType : MarketType.values()) {
			if (this.stockFacade.countByMarketType(marketType) == 0L) {
				// @formatter:off
				UriComponentsBuilder builder = UriComponentsBuilder.fromHttpUrl(AppConstants.PYTHON_BASE_URL + PYTHON_FETCH_STOCKS_PATH)
						.queryParam("marketType", marketType);
				// @formatter:on
				String result = this.restTemplate.getForObject(builder.toUriString(), String.class);
				if (!MessageConstant.SUCCESS.equals(result)) {
					log.warn(result);
				}
			}
		}
	}

	public void fetchStock(String code) {
		// @formatter:off
		UriComponentsBuilder builder = UriComponentsBuilder
				.fromHttpUrl(AppConstants.PYTHON_BASE_URL + PYTHON_FETCH_STOCK_PATH)
				.queryParam("code", code);
		// @formatter:on
		String result = this.restTemplate.getForObject(builder.toUriString(), String.class);
		if (!MessageConstant.SUCCESS.equals(result)) {
			log.warn(result);
		}
	}

	public void fetchStockRecord(String code) {
		// @formatter:off
		UriComponentsBuilder builder = UriComponentsBuilder
				.fromHttpUrl(AppConstants.PYTHON_BASE_URL + PYTHON_FETCH_STOCK_RECORDS_PATH)
				.queryParam("code", code);
		// @formatter:on
		String result = this.restTemplate.getForObject(builder.toUriString(), String.class);
		if (!MessageConstant.SUCCESS.equals(result)) {
			log.warn(result);
		}
	}

	public void fetchFunds() {
		if (this.fundFacade.count() == 0L) {
			// @formatter:off
			UriComponentsBuilder builder = UriComponentsBuilder
					.fromHttpUrl(AppConstants.PYTHON_BASE_URL + PYTHON_FETCH_FUNDS_PATH);
			// @formatter:on
			String result = this.restTemplate.getForObject(builder.toUriString(), String.class);
			if (!MessageConstant.SUCCESS.equals(result)) {
				log.warn(result);
			}
		}
	}

	public void fetchFund(String code) {
		// @formatter:off
		UriComponentsBuilder builder = UriComponentsBuilder
				.fromHttpUrl(AppConstants.PYTHON_BASE_URL + PYTHON_FETCH_FUND_PATH)
				.queryParam("code", code);
		// @formatter:on
		String result = this.restTemplate.getForObject(builder.toUriString(), String.class);
		if (!MessageConstant.SUCCESS.equals(result)) {
			log.warn(result);
		}
	}

	public void fetchFundRecord(String code) {
		// @formatter:off
		UriComponentsBuilder builder = UriComponentsBuilder
				.fromHttpUrl(AppConstants.PYTHON_BASE_URL + PYTHON_FETCH_FUND_RECORDS_PATH)
				.queryParam("code", code);
		// @formatter:on
		String result = this.restTemplate.getForObject(builder.toUriString(), String.class);
		if (!MessageConstant.SUCCESS.equals(result)) {
			log.warn(result);
		}
	}
}
