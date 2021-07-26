package io.tingkai.money.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import io.tingkai.money.constant.MessageConstant;
import io.tingkai.money.entity.StockRecord;
import io.tingkai.money.entity.UserTrackingStock;
import io.tingkai.money.model.exception.AlreadyExistException;
import io.tingkai.money.model.exception.FieldMissingException;
import io.tingkai.money.model.exception.NotExistException;
import io.tingkai.money.model.exception.QueryNotResultException;
import io.tingkai.money.model.response.StockResponse;
import io.tingkai.money.model.vo.StockVo;
import io.tingkai.money.service.DataFetcherService;
import io.tingkai.money.service.StockService;
import io.tingkai.money.service.UserStockService;

@RestController
@RequestMapping(value = StockController.CONROLLER_PREFIX)
public class StockController {

	public static final String CONROLLER_PREFIX = "/stock";
	public static final String GET_ALL_PATH = "/getAll";
	public static final String GET_RECORDS_PATH = "/getRecords";
	public static final String LATEST_RECORD_PATH = "/latestRecord";
	public static final String REFRESH_PATH = "/refresh";
	public static final String GET_TRACKING_LIST_PATH = "/getTrackingList";
	public static final String TRACK_PATH = "/track";
	public static final String UNTRACK_PATH = "/untrack";

	@Autowired
	private StockService stockService;

	@Autowired
	private UserStockService userStockService;

	@Autowired
	private DataFetcherService pythonFetcherService;

	@RequestMapping(value = StockController.GET_ALL_PATH, method = RequestMethod.GET)
	public StockResponse<List<StockVo>> getAll(@RequestParam(required = false) String code, @RequestParam(required = false) String name, @RequestParam(required = false, defaultValue = "true") boolean sort) throws QueryNotResultException {
		List<StockVo> stocks = this.stockService.getAll(code, name, sort);
		return new StockResponse<List<StockVo>>(true, stocks, MessageConstant.STOCK_GET_ALL_SUCCESS);
	}

	@RequestMapping(value = StockController.GET_RECORDS_PATH, method = RequestMethod.GET)
	public StockResponse<List<StockRecord>> getRecords(@RequestParam String code, @RequestParam long start, @RequestParam long end) throws QueryNotResultException {
		List<StockRecord> records = this.stockService.getAllRecords(code, start, end);
		return new StockResponse<List<StockRecord>>(true, records, MessageConstant.STOCK_GET_SUCCESS, code);
	}

	@RequestMapping(value = StockController.LATEST_RECORD_PATH, method = RequestMethod.GET)
	public StockResponse<StockRecord> latestRecord(@RequestParam String code) throws QueryNotResultException {
		StockRecord record = this.stockService.latestRecord(code);
		return new StockResponse<StockRecord>(true, record, MessageConstant.STOCK_GET_SUCCESS, code);
	}

	@RequestMapping(value = StockController.REFRESH_PATH, method = RequestMethod.POST)
	public StockResponse<Void> refresh(@RequestParam String code) {
		this.pythonFetcherService.fetchStockRecord(code);
		return new StockResponse<Void>(true, null, MessageConstant.STOCK_REFRESH_SUCCESS);
	}

	@RequestMapping(value = StockController.GET_TRACKING_LIST_PATH, method = RequestMethod.GET)
	public StockResponse<List<UserTrackingStock>> getAll(@RequestParam String username) throws QueryNotResultException {
		List<UserTrackingStock> stocks = this.userStockService.getUserTrackingStockList(username);
		return new StockResponse<List<UserTrackingStock>>(true, stocks, MessageConstant.USER_STOCK_GET_TRACKING_LIST_SUCCESS, username);
	}

	@RequestMapping(value = StockController.TRACK_PATH, method = RequestMethod.POST)
	public StockResponse<Void> track(@RequestParam String username, @RequestParam String code) throws AlreadyExistException, FieldMissingException, QueryNotResultException {
		this.userStockService.track(username, code);
		return new StockResponse<Void>(true, null, MessageConstant.STOCK_REFRESH_SUCCESS);
	}

	@RequestMapping(value = StockController.UNTRACK_PATH, method = RequestMethod.POST)
	public StockResponse<Void> untrack(@RequestParam String username, @RequestParam String code) throws QueryNotResultException, NotExistException {
		this.userStockService.untrack(username, code);
		return new StockResponse<Void>(true, null, MessageConstant.STOCK_REFRESH_SUCCESS);
	}
}
