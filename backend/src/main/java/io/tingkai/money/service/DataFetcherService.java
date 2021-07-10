package io.tingkai.money.service;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.text.MessageFormat;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.TreeMap;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.core.io.Resource;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
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
import io.tingkai.money.enumeration.FileType;
import io.tingkai.money.enumeration.MarketType;
import io.tingkai.money.facade.ExchangeRateFacade;
import io.tingkai.money.facade.ExchangeRateRecordFacade;
import io.tingkai.money.facade.StockFacade;
import io.tingkai.money.facade.StockRecordFacade;
import io.tingkai.money.logging.Loggable;
import io.tingkai.money.model.exception.AlreadyExistException;
import io.tingkai.money.model.exception.FieldMissingException;
import io.tingkai.money.model.exception.QueryNotResultException;
import io.tingkai.money.repository.FileRepository;
import io.tingkai.money.util.AppUtil;
import io.tingkai.money.util.TimeUtil;
import lombok.extern.slf4j.Slf4j;
import net.minidev.json.JSONObject;

@Service
@Loggable
@Slf4j
public class DataFetcherService {

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
	@Qualifier(CodeConstants.PYTHON_CACHE)
	private RedisTemplate<String, Set<String>> skipStockCache;

	/**
	 * save each stock update time
	 */
	@Autowired
	@Qualifier(CodeConstants.PYTHON_CACHE)
	private RedisTemplate<String, Map<String, Long>> stockRecordCache;

	@Autowired
	private ExchangeRateFacade exchangeRateFacade;

	@Autowired
	private ExchangeRateRecordFacade exchangeRateRecordFacade;

	@Autowired
	private StockFacade stockFacade;

	@Autowired
	private StockRecordFacade stockRecordFacade;

	@Autowired
	private FileService fileService;

	@Autowired
	RepositoryService repositoryService;

	public void fetchExchangeRate() throws AlreadyExistException, FieldMissingException, QueryNotResultException {
		if (this.exchangeRateFacade.count() == 0L) {
			List<ExchangeRate> data = new ArrayList<ExchangeRate>();
			ExchangeRate twd = new ExchangeRate();
			twd.setCurrency("TWD");
			twd.setName("新台幣");
			data.add(twd);
			JSONObject response = this.restTemplate.getForObject(AppConstants.PYTHON_BASE_URL + AppConstants.PYTHON_FETCH_PATH + StockController.CONROLLER_PREFIX, JSONObject.class);
			response.keySet().forEach(currency -> {
				ExchangeRate entity = new ExchangeRate();
				entity.setCurrency(currency);
				entity.setName(response.getAsString(currency));
				data.add(entity);
			});
			this.exchangeRateFacade.insertAll(data);
		}

		// sync cache
		List<ExchangeRate> cache = this.exchangeRateCache.opsForValue().get(CodeConstants.EXCHANGE_RATE_LIST_KEY);
		if (AppUtil.isEmpty(cache) || cache.size() != this.exchangeRateFacade.count()) {
			cache = this.exchangeRateFacade.queryAll();
			this.exchangeRateCache.opsForValue().set(CodeConstants.EXCHANGE_RATE_LIST_KEY, cache);
		}
	}

	public void fetechExchangeRateRecord(String currency) throws AlreadyExistException, FieldMissingException, IOException {
		LocalDateTime target = CodeConstants.EXCHANGE_RATE_FETCH_START_DATETIME;
		ExchangeRateRecord lastestRecord = null;
		try {
			lastestRecord = this.exchangeRateRecordFacade.queryNewestRecord(currency);
		} catch (QueryNotResultException e) {
			log.debug(e.getMessage());
		}
		if (AppUtil.isPresent(lastestRecord)) {
			target = lastestRecord.getDate();
			target = TimeUtil.plus(target, 1, ChronoUnit.DAYS);
		}
		List<ExchangeRateRecord> records = new ArrayList<ExchangeRateRecord>();
		while (target.getYear() * 12 + target.getMonthValue() <= LocalDateTime.now().getYear() * 12 + LocalDateTime.now().getMonthValue()) {
			// @formatter:off
			UriComponentsBuilder builder = UriComponentsBuilder
					.fromHttpUrl(MessageFormat.format(AppConstants.EXCHANGE_RATE_RECORD_URL, String.valueOf(target.getYear()), (target.getMonthValue() >= 10 ? "" : "0") + String.valueOf(target.getMonthValue()), currency));
			// @formatter:on
			ResponseEntity<Resource> response = restTemplate.exchange(builder.toUriString(), HttpMethod.GET, null, Resource.class);
			String filename = currency + "-" + String.valueOf(target.getYear()) + (target.getMonthValue() >= 10 ? "" : "0") + String.valueOf(target.getMonthValue()) + ".csv";
			FileRepository repository = this.repositoryService.getFileRepository(FileType.CSV);
			OutputStream updaloadStream = this.fileService.getUploadStream(repository.getName(), filename, "backup");
			updaloadStream.write(response.getBody().getInputStream().readAllBytes());
			updaloadStream.close();

			try (BufferedReader br = new BufferedReader(new InputStreamReader(response.getBody().getInputStream()))) {
				br.readLine();
				String line;
				while ((line = br.readLine()) != null) {
					String[] values = line.split(",");
					DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyyMMdd").withZone(CodeConstants.ZONE_TPE);
					LocalDateTime rowDate = LocalDate.parse(values[0], formatter).atStartOfDay();
					if (TimeUtil.diff(rowDate, target) < 0) {
						continue;
					}
					ExchangeRateRecord record = new ExchangeRateRecord();
					record.setCurrency(currency);
					record.setDate(rowDate);
					record.setCashBuy(AppUtil.toBigDecimal(values[3], null));
					record.setCashSell(AppUtil.toBigDecimal(values[13], null));
					record.setSpotBuy(AppUtil.toBigDecimal(values[4], null));
					record.setSpotSell(AppUtil.toBigDecimal(values[14], null));
					records.add(record);
				}
			}

			target = TimeUtil.plus(target, 1, ChronoUnit.MONTHS);
		}
		if (records.size() > 0) {
			this.exchangeRateRecordFacade.insertAll(records);
		}

		saveUpdateTime(exchangeRateRecordCache, CodeConstants.EXCHANGE_RATE_RECORD_UPDATE_TIME_KEY, currency);
	}

	public void fetchStocks() {
		List<Stock> data = new ArrayList<Stock>();
		for (MarketType marketType : MarketType.values()) {
			if (this.stockFacade.countByMarketType(marketType) == 0L) {
				// @formatter:off
				UriComponentsBuilder builder = UriComponentsBuilder
						.fromHttpUrl(AppConstants.PYTHON_BASE_URL + AppConstants.PYTHON_FETCH_PATH + StockController.CONROLLER_PREFIX)
						.queryParam("marketType", marketType);
				// @formatter:on
				JSONObject response = this.restTemplate.getForObject(builder.toUriString(), JSONObject.class);

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

		try {
			this.stockFacade.insertAll(data);
		} catch (AlreadyExistException | FieldMissingException e) {
			log.warn(e.getMessage());
		}
	}

	public void fetchStock(String code) {
		// @formatter:off
		UriComponentsBuilder builder = UriComponentsBuilder
				.fromHttpUrl(AppConstants.PYTHON_BASE_URL + AppConstants.PYTHON_FETCH_PATH + StockController.CONROLLER_PREFIX)
				.queryParam("code", code);
		// @formatter:on
		JSONObject response = this.restTemplate.getForObject(builder.toUriString(), JSONObject.class);
		System.out.println(response);
		if (response instanceof HashMap) {
			HashMap<String, Object> detail = (HashMap<String, Object>) response;
			Stock entity = new Stock();
			entity.setCode(code);
			entity.setName(AppUtil.toString(detail.get("name")));
			entity.setIsinCode(AppUtil.toString(detail.get("isinCode")));
			DateTimeFormatter formatter = DateTimeFormatter.ofPattern(CodeConstants.DATE_FORMAT).withZone(CodeConstants.ZONE_TPE);
			entity.setOfferingDate(LocalDate.parse(AppUtil.toString(detail.get("offeringDate")), formatter).atStartOfDay());
			entity.setMarketType(MarketType.valueOf(AppUtil.toString(detail.get("marketType"))));
			entity.setIndustryType(AppUtil.toString(detail.get("industryType")));
			entity.setCfiCode(AppUtil.toString(detail.get("cfiCode")));
			entity.setDescription(AppUtil.toString(detail.get("description")));
			try {
				this.stockFacade.insert(entity);
			} catch (AlreadyExistException | FieldMissingException e) {
				log.warn(e.getMessage());
			}
		}
	}

	public boolean fetchStockRecord(String code) {
		List<Stock> list = new ArrayList<Stock>();
		try {
			list = this.stockFacade.queryAll(false);
		} catch (QueryNotResultException e) {
			log.warn(e.getMessage());
		}
		Optional<Stock> stockOptional = list.stream().filter(x -> x.getCode().equals(code)).findFirst();
		if (stockOptional.isPresent()) {
			Stock stock = stockOptional.get();
			LocalDateTime target = stock.getOfferingDate();
			StockRecord lastestRecord = null;
			try {
				lastestRecord = this.stockRecordFacade.latestRecord(stock.getCode());
			} catch (QueryNotResultException e) {
				e.printStackTrace();
			}
			if (AppUtil.isPresent(lastestRecord)) {
				target = lastestRecord.getDealDate();
				target = TimeUtil.plus(target, 1, ChronoUnit.DAYS);
			}
			List<StockRecord> records = new ArrayList<StockRecord>();
			if (TimeUtil.diff(LocalDateTime.now(), target) > CodeConstants.UPDATE_FREQUENCY_HOURS * TimeUtil.HOUR_MILISECS) {
				String yahooStockCode = stock.getCode() + (stock.getMarketType() == MarketType.LSE ? ".TW" : ".TWO");
				long startTime = TimeUtil.convertToTimeStamp(target) / 1000L;
				long endTime = TimeUtil.getCurrentDateTime() / 1000L;
				log.debug("Fetching Stock<{}> Data, from {} to {}", yahooStockCode, startTime, endTime);
				// @formatter:off
				UriComponentsBuilder builder = UriComponentsBuilder
						.fromHttpUrl(AppConstants.PYTHON_BASE_URL + AppConstants.PYTHON_FETCH_PATH + "/allStockRecord")
						.queryParam("code", yahooStockCode)
						.queryParam("start", startTime)
						.queryParam("end", endTime);
				// @formatter:on
				JSONObject data = this.restTemplate.getForObject(builder.toUriString(), JSONObject.class);
				if (!data.isEmpty()) {
					for (String dateStr : data.keySet()) {
						StockRecord newRecord = this.toStockRecord(code, dateStr, data.get(dateStr));
						// if last deal date is not in python return data
						if (!AppUtil.isPresent(lastestRecord) || TimeUtil.diff(lastestRecord.getDealDate(), newRecord.getDealDate()) != 0L) {
							records.add(this.toStockRecord(code, dateStr, data.get(dateStr)));
						}
					}
				} else {
					log.warn("Stock: <{}: {}> range: <{} ~ {}> Get No Data", stock.getCode(), stock.getName(), startTime, endTime);
					Set<String> skipList = this.skipStockCache.opsForValue().get(CodeConstants.STOCK_SKIP_FETCH_LIST_KEY);
					skipList.add(stock.getCode());
					this.skipStockCache.opsForValue().set(CodeConstants.STOCK_SKIP_FETCH_LIST_KEY, skipList);
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
					this.stockRecordFacade.insertAll(records);
					saveUpdateTime(stockRecordCache, CodeConstants.STOCK_RECORD_UPDATE_TIME_KEY, code);
				} catch (Exception e) {
					log.warn(e.getMessage());
				}
				log.info("Fetching Stock<{}:{}> Complete, Data Count: {}", code, stock.getName(), records.size());
			}
			return true;
		} else {
			log.warn("Stock code: <{}> Not Found", code);
			return false;
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

	private void saveUpdateTime(RedisTemplate<String, Map<String, Long>> cache, String cacheKey, String mapKey) {
		Map<String, Long> updateTime = cache.opsForValue().get(cacheKey);
		if (AppUtil.isEmpty(updateTime)) {
			updateTime = new TreeMap<String, Long>();
		}
		updateTime.put(mapKey, TimeUtil.getCurrentDateTime());
		cache.opsForValue().set(cacheKey, updateTime);
	}
}