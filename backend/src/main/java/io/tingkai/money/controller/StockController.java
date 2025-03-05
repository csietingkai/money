package io.tingkai.money.controller;

import java.math.BigDecimal;
import java.text.MessageFormat;
import java.util.List;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import io.tingkai.base.model.exception.AlreadyExistException;
import io.tingkai.base.model.exception.FieldMissingException;
import io.tingkai.base.model.exception.NotExistException;
import io.tingkai.money.constant.MessageConstant;
import io.tingkai.money.entity.UserStock;
import io.tingkai.money.entity.UserStockRecord;
import io.tingkai.money.enumeration.DealType;
import io.tingkai.money.model.exception.AccountBalanceNotEnoughException;
import io.tingkai.money.model.exception.StockAmountInvalidException;
import io.tingkai.money.model.request.StockBonusRequest;
import io.tingkai.money.model.request.StockBuyRequest;
import io.tingkai.money.model.request.StockSellRequest;
import io.tingkai.money.model.request.StockTradeRecordEditRequest;
import io.tingkai.money.model.response.AccountResponse;
import io.tingkai.money.model.response.StockResponse;
import io.tingkai.money.model.vo.PredictResultVo;
import io.tingkai.money.model.vo.StockRecordVo;
import io.tingkai.money.model.vo.StockVo;
import io.tingkai.money.model.vo.UserStockRecordVo;
import io.tingkai.money.model.vo.UserStockVo;
import io.tingkai.money.model.vo.UserTrackingStockVo;
import io.tingkai.money.service.DataFetcherService;
import io.tingkai.money.service.PredictService;
import io.tingkai.money.service.StockService;
import io.tingkai.money.service.UserStockService;

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
	public static final String BONUS_PATH = "/bonus";
	public static final String UPDATE_RECORD_PATH = "/updateRecord";
	public static final String DELETE_RECORD_PATH = "/deleteRecord";
	public static final String GET_OWN_PATH = "/getOwn";
	public static final String GET_OWN_RECORDS_PATH = "/getOwnRecords";
	public static final String GET_TRACKING_LIST_PATH = "/getTrackingList";
	public static final String TRACK_PATH = "/track";
	public static final String UNTRACK_PATH = "/untrack";
	public static final String PREDICT_PATH = "/predict";

	@Autowired
	private StockService stockService;

	@Autowired
	private UserStockService userStockService;

	@Autowired
	private DataFetcherService pythonFetcherService;

	@Autowired
	private PredictService predictService;

	@RequestMapping(value = StockController.GET_ALL_PATH, method = RequestMethod.GET)
	public StockResponse<List<StockVo>> getAll(@RequestParam(required = false) String code, @RequestParam(required = false) String name, @RequestParam(required = false, defaultValue = "true") boolean sort) {
		List<StockVo> stocks = this.stockService.getAll(code, name, sort);
		return new StockResponse<List<StockVo>>(true, stocks, MessageConstant.STOCK_GET_ALL_SUCCESS);
	}

	@RequestMapping(value = StockController.GET_RECORDS_PATH, method = RequestMethod.GET)
	public StockResponse<List<StockRecordVo>> getRecords(@RequestParam String code) {
		List<StockRecordVo> records = this.stockService.getAllRecords(code);
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
	public StockResponse<UserStock> buy(@RequestBody StockBuyRequest request) throws AccountBalanceNotEnoughException, StockAmountInvalidException, NotExistException, FieldMissingException, AlreadyExistException {
		UserStock result = this.userStockService.buy(request);
		return new StockResponse<UserStock>(true, result, MessageFormat.format(MessageConstant.USER_STOCK_BUY_SUCCESS, request.getStockCode(), request.getShare(), request.getPrice()));
	}

	@RequestMapping(value = StockController.SELL_PATH, method = RequestMethod.PUT)
	public StockResponse<UserStock> sell(@RequestBody StockSellRequest request) throws AccountBalanceNotEnoughException, StockAmountInvalidException, NotExistException, FieldMissingException, AlreadyExistException {
		UserStock result = this.userStockService.sell(request);
		return new StockResponse<UserStock>(true, result, MessageFormat.format(MessageConstant.USER_STOCK_SELL_SUCCESS, request.getStockCode(), request.getShare(), request.getPrice()));
	}

	@RequestMapping(value = StockController.BONUS_PATH, method = RequestMethod.PUT)
	public StockResponse<UserStock> bonus(@RequestBody StockBonusRequest request) throws AccountBalanceNotEnoughException, StockAmountInvalidException, NotExistException, FieldMissingException, AlreadyExistException {
		UserStock result = this.userStockService.bonus(request);
		return new StockResponse<UserStock>(true, result, MessageFormat.format(MessageConstant.USER_STOCK_BONUS_SUCCESS, request.getTotal(), request.getStockCode()));
	}

	@RequestMapping(value = StockController.UPDATE_RECORD_PATH, method = RequestMethod.PUT)
	public StockResponse<UserStock> updateRecord(@RequestBody StockTradeRecordEditRequest request) throws StockAmountInvalidException, NotExistException, FieldMissingException {
		UserStock result = this.userStockService.updateRecord(request);
		return new StockResponse<UserStock>(true, result, MessageConstant.USER_STOCK_RECORD_UPDATE_SUCCESS);
	}

	@RequestMapping(value = StockController.DELETE_RECORD_PATH, method = RequestMethod.DELETE)
	public AccountResponse<Void> deleteRecord(@RequestParam UUID recordId) throws NotExistException, FieldMissingException {
		this.userStockService.reverseRecord(recordId);
		return new AccountResponse<Void>(true, null, MessageConstant.USER_STOCK_RECORD_DELETE_SUCCESS);
	}

	@RequestMapping(value = StockController.GET_OWN_PATH, method = RequestMethod.GET)
	public StockResponse<List<UserStockVo>> getOwnStocks() {
		List<UserStockVo> result = this.userStockService.getOwnStocks();
		return new StockResponse<List<UserStockVo>>(true, result, MessageConstant.SUCCESS);
	}

	@RequestMapping(value = StockController.GET_OWN_RECORDS_PATH, method = RequestMethod.GET)
	public StockResponse<List<UserStockRecordVo>> getOwnStockRecords(@RequestParam UUID userStockId) {
		List<UserStockRecordVo> result = this.userStockService.getOwnStockRecords(userStockId);
		return new StockResponse<List<UserStockRecordVo>>(true, result, MessageConstant.SUCCESS);
	}

	@RequestMapping(value = StockController.GET_TRACKING_LIST_PATH, method = RequestMethod.GET)
	public StockResponse<List<UserTrackingStockVo>> getAll() {
		List<UserTrackingStockVo> stocks = this.userStockService.getUserTrackingStockList();
		return new StockResponse<List<UserTrackingStockVo>>(true, stocks, MessageConstant.USER_STOCK_GET_TRACKING_LIST_SUCCESS);
	}

	@RequestMapping(value = StockController.TRACK_PATH, method = RequestMethod.POST)
	public StockResponse<Void> track(@RequestParam String code) throws AlreadyExistException, FieldMissingException {
		this.userStockService.track(code);
		return new StockResponse<Void>(true, null, MessageConstant.SUCCESS);
	}

	@RequestMapping(value = StockController.UNTRACK_PATH, method = RequestMethod.POST)
	public StockResponse<Void> untrack(@RequestParam String code) throws NotExistException {
		this.userStockService.untrack(code);
		return new StockResponse<Void>(true, null, MessageConstant.SUCCESS);
	}

	@RequestMapping(value = StockController.PREDICT_PATH, method = RequestMethod.GET)
	public StockResponse<List<PredictResultVo>> predict(@RequestParam String code, @RequestParam(required = false) int days) throws NotExistException {
		List<PredictResultVo> result = predictService.predictStock(code, days);
		return new StockResponse<List<PredictResultVo>>(true, result, MessageConstant.SUCCESS);
	}
}
