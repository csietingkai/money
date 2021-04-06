package io.tingkai.money.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import io.tingkai.money.constant.MessageConstant;
import io.tingkai.money.entity.Stock;
import io.tingkai.money.entity.StockRecord;
import io.tingkai.money.entity.UserTrackingStock;
import io.tingkai.money.model.exception.QueryNotResultException;
import io.tingkai.money.model.response.SimpleResponse;
import io.tingkai.money.model.response.StockResponse;
import io.tingkai.money.service.PythonFetcherService;
import io.tingkai.money.service.StockRecordService;
import io.tingkai.money.service.StockService;
import io.tingkai.money.service.UserTrackingStockService;

/**
 * Simple controller for stocks info and their records
 * 
 * @author tingkai
 */
@RestController
@RequestMapping(value = StockController.CONROLLER_PREFIX)
public class StockController {

	public static final String CONROLLER_PREFIX = "/stock";
	public static final String GET_ALL_PATH = "/getAll";
	public static final String GET_PATH = "/get";
	public static final String GET_RECORDS_PATH = "/getRecords";
	public static final String GET_RECORD_PATH = "/getRecord";
	public static final String REFRESH_PATH = "/refresh";
	public static final String GET_TRACKING_LIST_PATH = "/getTrackingList";

	@Autowired
	private StockService stockService;

	@Autowired
	private StockRecordService stockRecordService;

	@Autowired
	private PythonFetcherService pythonFetcherService;

	@Autowired
	private UserTrackingStockService usetraTrackingStockService;

	@RequestMapping(value = StockController.GET_ALL_PATH, method = RequestMethod.GET)
	public StockResponse<List<Stock>> getAll() throws QueryNotResultException {
		List<Stock> stocks = this.stockService.getAll();
		return new StockResponse<List<Stock>>(true, stocks, MessageConstant.STOCK_GET_ALL_SUCCESS);
	}

	@RequestMapping(value = StockController.GET_PATH, method = RequestMethod.GET)
	public StockResponse<Stock> get(@RequestParam String code) throws QueryNotResultException {
		Stock entity = this.stockService.get(code);
		return new StockResponse<Stock>(true, entity, MessageConstant.STOCK_GET_SUCCESS, code);
	}

	@RequestMapping(value = StockController.GET_RECORDS_PATH, method = RequestMethod.GET)
	public StockResponse<List<StockRecord>> getRecords(@RequestParam String code) throws QueryNotResultException {
		List<StockRecord> records = this.stockRecordService.getAll(code);
		return new StockResponse<List<StockRecord>>(true, records, MessageConstant.STOCK_GET_SUCCESS, code);
	}

	@RequestMapping(value = StockController.GET_RECORD_PATH, method = RequestMethod.GET)
	public StockResponse<List<StockRecord>> get(@RequestParam String code, @RequestParam long start, @RequestParam long end) throws QueryNotResultException {
		List<StockRecord> records = this.stockRecordService.get(code, start, end);
		return new StockResponse<List<StockRecord>>(true, records, MessageConstant.STOCK_GET_SUCCESS, code);
	}

	@RequestMapping(value = StockController.REFRESH_PATH, method = RequestMethod.POST)
	public SimpleResponse refresh(@RequestParam String code) {
		boolean result = this.pythonFetcherService.fetchStockRecord(code);
		return new SimpleResponse(result);
	}

	@RequestMapping(value = StockController.GET_TRACKING_LIST_PATH, method = RequestMethod.GET)
	public StockResponse<List<UserTrackingStock>> getAll(@RequestParam String username) {
		List<UserTrackingStock> stocks = this.usetraTrackingStockService.getUserTrackingStockList(username);
		return new StockResponse<List<UserTrackingStock>>(true, stocks, MessageConstant.USER_STOCK_GET_TRACKING_LIST_SUCCESS, username);
	}
}
