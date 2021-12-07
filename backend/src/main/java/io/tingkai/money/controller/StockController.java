package io.tingkai.money.controller;

import java.math.BigDecimal;
import java.text.MessageFormat;
import java.util.List;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import io.tingkai.money.constant.MessageConstant;
import io.tingkai.money.entity.UserStock;
import io.tingkai.money.entity.UserStockRecord;
import io.tingkai.money.enumeration.DealType;
import io.tingkai.money.model.exception.AccountBalanceNotEnoughException;
import io.tingkai.money.model.exception.AlreadyExistException;
import io.tingkai.money.model.exception.FieldMissingException;
import io.tingkai.money.model.exception.NotExistException;
import io.tingkai.money.model.exception.StockAmountInvalidException;
import io.tingkai.money.model.response.StockResponse;
import io.tingkai.money.model.vo.StockRecordVo;
import io.tingkai.money.model.vo.StockVo;
import io.tingkai.money.model.vo.UserStockVo;
import io.tingkai.money.model.vo.UserTrackingStockVo;
import io.tingkai.money.service.DataFetcherService;
import io.tingkai.money.service.StockService;
import io.tingkai.money.service.UserStockService;
import io.tingkai.money.util.TimeUtil;

@RestController
@RequestMapping(value = StockController.CONROLLER_PREFIX)
public class StockController {

	public static final String CONROLLER_PREFIX = "/stock";
	public static final String GET_ALL_PATH = "/getAll";
	public static final String GET_RECORDS_PATH = "/getRecords";
	public static final String REFRESH_PATH = "/refresh";
	public static final String PRECALC_PATH = "/precalc";
	public static final String BUY_PATH = "/buy";
	public static final String SELL_PATH = "/sell";
	public static final String GET_OWN_PATH = "/getOwn";
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
	public StockResponse<List<StockVo>> getAll(@RequestParam(required = false) String code, @RequestParam(required = false) String name, @RequestParam(required = false, defaultValue = "true") boolean sort) {
		List<StockVo> stocks = this.stockService.getAll(code, name, sort);
		return new StockResponse<List<StockVo>>(true, stocks, MessageConstant.STOCK_GET_ALL_SUCCESS);
	}

	@RequestMapping(value = StockController.GET_RECORDS_PATH, method = RequestMethod.GET)
	public StockResponse<List<StockRecordVo>> getRecords(@RequestParam String code, @RequestParam long start, @RequestParam long end) {
		List<StockRecordVo> records = this.stockService.getAllRecords(code, start, end);
		return new StockResponse<List<StockRecordVo>>(true, records, MessageConstant.STOCK_GET_SUCCESS, code);
	}

	@RequestMapping(value = StockController.REFRESH_PATH, method = RequestMethod.POST)
	public StockResponse<Void> refresh(@RequestParam String code) {
		this.pythonFetcherService.fetchStockRecord(code);
		return new StockResponse<Void>(true, null, MessageConstant.STOCK_REFRESH_SUCCESS);
	}

	@RequestMapping(value = StockController.PRECALC_PATH, method = RequestMethod.GET)
	public StockResponse<UserStockRecord> precalc(@RequestParam DealType dealType, @RequestParam BigDecimal share, @RequestParam BigDecimal price) throws NotExistException {
		UserStockRecord result = this.userStockService.preCalc(dealType, share, price);
		return new StockResponse<UserStockRecord>(true, result, MessageConstant.USER_STOCK_PRECALC_SUCCESS);
	}

	@RequestMapping(value = StockController.BUY_PATH, method = RequestMethod.PUT)
	public StockResponse<UserStock> buy(@RequestParam String username, @RequestParam UUID accountId, @RequestParam String stockCode, @RequestParam long date, @RequestParam BigDecimal share, @RequestParam BigDecimal price, @RequestParam BigDecimal fix, @RequestParam BigDecimal fee) throws AccountBalanceNotEnoughException, StockAmountInvalidException, NotExistException, FieldMissingException, AlreadyExistException {
		UserStock result = this.userStockService.buy(username, accountId, stockCode, TimeUtil.convertToDateTime(date), share, price, fix, fee);
		return new StockResponse<UserStock>(true, result, MessageFormat.format(MessageConstant.USER_STOCK_BUY_SUCCESS, username, stockCode, share, price));
	}

	@RequestMapping(value = StockController.SELL_PATH, method = RequestMethod.PUT)
	public StockResponse<UserStock> sell(@RequestParam String username, @RequestParam UUID accountId, @RequestParam String stockCode, @RequestParam long date, @RequestParam BigDecimal share, @RequestParam BigDecimal price, @RequestParam BigDecimal fix, @RequestParam BigDecimal fee, @RequestParam BigDecimal tax) throws AccountBalanceNotEnoughException, StockAmountInvalidException, NotExistException, FieldMissingException, AlreadyExistException {
		UserStock result = this.userStockService.sell(username, accountId, stockCode, TimeUtil.convertToDateTime(date), share, price, fix, fee, tax);
		return new StockResponse<UserStock>(true, result, MessageFormat.format(MessageConstant.USER_STOCK_SELL_SUCCESS, username, stockCode, share, price));
	}

	@RequestMapping(value = StockController.GET_OWN_PATH, method = RequestMethod.GET)
	public StockResponse<List<UserStockVo>> sell(@RequestParam String username) {
		List<UserStockVo> result = this.userStockService.getAll(username, true);
		return new StockResponse<List<UserStockVo>>(true, result, MessageConstant.SUCCESS);
	}

	@RequestMapping(value = StockController.GET_TRACKING_LIST_PATH, method = RequestMethod.GET)
	public StockResponse<List<UserTrackingStockVo>> getAll(@RequestParam String username) {
		List<UserTrackingStockVo> stocks = this.userStockService.getUserTrackingStockList(username);
		return new StockResponse<List<UserTrackingStockVo>>(true, stocks, MessageConstant.USER_STOCK_GET_TRACKING_LIST_SUCCESS, username);
	}

	@RequestMapping(value = StockController.TRACK_PATH, method = RequestMethod.POST)
	public StockResponse<Void> track(@RequestParam String username, @RequestParam String code) throws AlreadyExistException, FieldMissingException {
		this.userStockService.track(username, code);
		return new StockResponse<Void>(true, null, MessageConstant.STOCK_REFRESH_SUCCESS);
	}

	@RequestMapping(value = StockController.UNTRACK_PATH, method = RequestMethod.POST)
	public StockResponse<Void> untrack(@RequestParam String username, @RequestParam String code) throws NotExistException {
		this.userStockService.untrack(username, code);
		return new StockResponse<Void>(true, null, MessageConstant.STOCK_REFRESH_SUCCESS);
	}
}
