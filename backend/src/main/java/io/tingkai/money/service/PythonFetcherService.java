package io.tingkai.money.service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Set;
import java.util.TreeSet;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import io.tingkai.money.constant.AppConstants;
import io.tingkai.money.constant.CodeConstants;
import io.tingkai.money.controller.StockController;
import io.tingkai.money.entity.ExchangeRate;
import io.tingkai.money.entity.ExchangeRateRecord;
import io.tingkai.money.entity.Stock;
import io.tingkai.money.entity.StockRecord;
import io.tingkai.money.enumeration.MarketType;
import io.tingkai.money.util.AppUtil;
import io.tingkai.money.util.TimeUtil;
import lombok.extern.slf4j.Slf4j;
import net.minidev.json.JSONObject;

/**
 * provide method for fetch data to client or store into database
 * 
 * @author tingkai
 */
@Service
@Slf4j
public class PythonFetcherService {

	@Autowired
	private RestTemplate pythonServer;

	@Autowired
	@Qualifier(CodeConstants.PYTHON_CACHE)
	private RedisTemplate<String, List<ExchangeRate>> exchangeRateCache;

	@Autowired
	@Qualifier(CodeConstants.PYTHON_CACHE)
	private RedisTemplate<String, List<Stock>> stockCache;

	@Autowired
	@Qualifier(CodeConstants.PYTHON_CACHE)
	private RedisTemplate<String, Set<String>> skipStockCache;

	@Autowired
	private ExchangeRateService exchangeRateService;

	@Autowired
	private ExchangeRateRecordService exchangeRateRecordService;

	@Autowired
	private StockService stockService;

	@Autowired
	private StockRecordService stockRecordService;

	public void fetchExchangeRate() {
		if (this.exchangeRateService.count() == 0L) {
			List<ExchangeRate> data = new ArrayList<ExchangeRate>();
			JSONObject response = this.pythonServer.getForObject(AppConstants.PYTHON_BASE_URL + AppConstants.PYTHON_FETCH_PATH + StockController.CONROLLER_PREFIX, JSONObject.class);
			response.keySet().forEach(currency -> {
				ExchangeRate entity = new ExchangeRate();
				entity.setCurrency(currency);
				entity.setName(response.getAsString(currency));
				data.add(entity);
			});
			this.exchangeRateService.saveAll(data);
		}

		// sync cache
		List<ExchangeRate> cache = this.exchangeRateCache.opsForValue().get(CodeConstants.CURRENCY_LIST_KEY);
		if (AppUtil.isEmpty(cache) || cache.size() != this.exchangeRateService.count()) {
			cache = this.exchangeRateService.getAll();
			this.exchangeRateCache.opsForValue().set(CodeConstants.CURRENCY_LIST_KEY, cache);
		}
	}

	public void fetechExchangeRateRecord() {
		List<ExchangeRate> cache = this.exchangeRateCache.opsForValue().get(CodeConstants.CURRENCY_LIST_KEY);
		cache.forEach(exchangeRate -> {
			LocalDateTime target = CodeConstants.CURRENCY_FETCH_START_DATETIME;
			ExchangeRateRecord lastestRecord = this.exchangeRateRecordService.lastestRecord(exchangeRate.getCurrency());
			if (AppUtil.isPresent(lastestRecord)) {
				target = lastestRecord.getDate();
				target = TimeUtil.plus(target, 1, ChronoUnit.DAYS);
			}
			List<ExchangeRateRecord> records = new ArrayList<ExchangeRateRecord>();
			while (!TimeUtil.isInOneDay(LocalDateTime.now(), target) && LocalDateTime.now().isAfter(target)) {
				// @formatter:off
				UriComponentsBuilder builder = UriComponentsBuilder
						.fromHttpUrl(AppConstants.PYTHON_BASE_URL + AppConstants.PYTHON_FETCH_PATH + "/exchangeRateRecord")
						.queryParam("currency", exchangeRate.getCurrency())
						.queryParam("year", target.getYear())
						.queryParam("month", target.getMonthValue())
						.queryParam("day", target.getDayOfMonth());
				// @formatter:on
				JSONObject datas = pythonServer.getForObject(builder.toUriString(), JSONObject.class);
				for (String dateStr : datas.keySet()) {
					records.add(this.toExchangeRateRecord(exchangeRate.getCurrency(), dateStr, datas.get(dateStr)));
				}
				target = TimeUtil.plus(target, 1, ChronoUnit.DAYS);
			}
			if (records.size() > 0) {
				this.exchangeRateRecordService.saveAll(records);
			}
		});
	}

	private ExchangeRateRecord toExchangeRateRecord(String currency, String dateStr, Object obj) {
		ExchangeRateRecord record = new ExchangeRateRecord();
		record.setCurrency(currency);
		DateTimeFormatter formatter = DateTimeFormatter.ofPattern(CodeConstants.DATE_FORMAT).withZone(CodeConstants.ZONE_TPE);
		record.setDate(LocalDate.parse(dateStr, formatter).atStartOfDay());
		if (obj instanceof List<?>) {
			List<?> list = (List<?>) obj;
			record.setCashBuy(AppUtil.toBigDecimal(list.get(0), null));
			record.setCashSell(AppUtil.toBigDecimal(list.get(1), null));
			record.setSpotBuy(AppUtil.toBigDecimal(list.get(2), null));
			record.setSpotSell(AppUtil.toBigDecimal(list.get(3), null));
		}
		return record;
	}

	public void fetchStock() {
		List<Stock> data = new ArrayList<Stock>();
		for (MarketType marketType : MarketType.values()) {
			if (this.stockService.countByMarketType(marketType) == 0L) {
				// @formatter:off
				UriComponentsBuilder builder = UriComponentsBuilder
						.fromHttpUrl(AppConstants.PYTHON_BASE_URL + AppConstants.PYTHON_FETCH_PATH + StockController.CONROLLER_PREFIX)
						.queryParam("marketType", marketType);
				// @formatter:on
				JSONObject response = this.pythonServer.getForObject(builder.toUriString(), JSONObject.class);

				response.keySet().forEach(code -> {
					Stock entity = new Stock();
					entity.setCode(code);
					if (response.get(code) instanceof HashMap) {
						@SuppressWarnings("unchecked")
						HashMap<String, Object> detail = (HashMap<String, Object>) response.get(code);
						entity.setName(AppUtil.toString(detail.get("name")));
						entity.setIsinCode(AppUtil.toString(detail.get("isinCode")));
						DateTimeFormatter formatter = DateTimeFormatter.ofPattern(CodeConstants.DATE_FORMAT).withZone(CodeConstants.ZONE_TPE);
						entity.setOfferingDate(LocalDate.parse(AppUtil.toString(detail.get("offeringDate")), formatter).atStartOfDay());
						entity.setMarketType(marketType);
						entity.setIndustryType(AppUtil.toString(detail.get("industryType")));
						entity.setCfiCode(AppUtil.toString(detail.get("cfiCode")));
						entity.setDescription(AppUtil.toString(detail.get("description")));
					}
					data.add(entity);
				});
			}
		}

		this.stockService.saveAll(data);
	}

	public void fetchStockRecord() {
		List<Stock> list = this.stockService.getAll();
		Set<String> skipList = this.skipStockCache.opsForValue().get(CodeConstants.STOCK_SKIP_FETCH_LIST_KEY);
		if (AppUtil.isEmpty(skipList)) {
			skipList = new TreeSet<String>();
			this.skipStockCache.opsForValue().set(CodeConstants.STOCK_SKIP_FETCH_LIST_KEY, skipList);
		}
		for (Stock stock : list) {
			if (skipList.contains(stock.getCode())) {
				continue;
			}

			LocalDateTime target = stock.getOfferingDate();
			StockRecord lastestRecord = this.stockRecordService.lastestRecord(stock.getCode());
			if (AppUtil.isPresent(lastestRecord)) {
				target = lastestRecord.getDealDate();
				target = TimeUtil.plus(target, 1, ChronoUnit.DAYS);
			}
			List<StockRecord> records = new ArrayList<StockRecord>();
			if (!TimeUtil.isInOneDay(LocalDateTime.now(), target) && LocalDateTime.now().isAfter(target) && !skipList.contains(stock.getCode())) {
				String code = stock.getCode() + (stock.getMarketType() == MarketType.LES ? ".TWO" : ".TW");
				long startTime = TimeUtil.convertToTimeStamp(target) / 1000L;
				long endTime = TimeUtil.getCurrentDateTime() / 1000L;
				log.debug("Fetching Stock<" + code + "> Data, from " + startTime + " to " + endTime);
				// @formatter:off
				UriComponentsBuilder builder = UriComponentsBuilder
						.fromHttpUrl(AppConstants.PYTHON_BASE_URL + AppConstants.PYTHON_FETCH_PATH + "/allStockRecord")
						.queryParam("code", code)
						.queryParam("start", startTime)
						.queryParam("end", endTime);
				// @formatter:on
				JSONObject data = pythonServer.getForObject(builder.toUriString(), JSONObject.class);
				if (!data.isEmpty()) {
					for (String dateStr : data.keySet()) {
						records.add(this.toStockRecord(stock.getCode(), dateStr, data.get(dateStr)));
					}
				} else {
					skipList.add(stock.getCode());
					this.skipStockCache.opsForValue().set(CodeConstants.STOCK_SKIP_FETCH_LIST_KEY, skipList);
					log.warn("Stock: <{}: {}> Get No Data, Next Time Will Skip.", stock.getCode(), stock.getName());
				}
				target = TimeUtil.plus(target, 1, ChronoUnit.DAYS);
				try {
					Thread.sleep(3000);
				} catch (InterruptedException e) {
					e.printStackTrace();
				}
			}
			if (records.size() > 0) {
				try {
					this.stockRecordService.saveAll(records);
				} catch (Exception e) {
					log.warn(e.getMessage());
					skipList.add(stock.getCode());
				}
			}
		}
	}

	private StockRecord toStockRecord(String code, String dateStr, Object obj) {
		StockRecord record = new StockRecord();
		record.setCode(code);
		DateTimeFormatter formatter = DateTimeFormatter.ofPattern(CodeConstants.DATE_FORMAT).withZone(CodeConstants.ZONE_TPE);
		record.setDealDate(LocalDate.parse(dateStr, formatter).atStartOfDay());
		if (obj instanceof List<?>) {
			List<?> list = (List<?>) obj;
			record.setOpenPrice(AppUtil.toBigDecimal(list.get(0), null));
			record.setHighPrice(AppUtil.toBigDecimal(list.get(1), null));
			record.setLowPrice(AppUtil.toBigDecimal(list.get(2), null));
			record.setClosePrice(AppUtil.toBigDecimal(list.get(3), null));
			record.setDealShare(AppUtil.toBigDecimal(list.get(4), null));
		}
		return record;
	}
}
