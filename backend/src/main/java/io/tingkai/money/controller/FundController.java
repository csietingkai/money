package io.tingkai.money.controller;

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
import io.tingkai.money.entity.UserFund;
import io.tingkai.money.model.exception.AccountBalanceNotEnoughException;
import io.tingkai.money.model.exception.FundAmountInvalidException;
import io.tingkai.money.model.exception.StockAmountInvalidException;
import io.tingkai.money.model.request.FundBonusRequest;
import io.tingkai.money.model.request.FundBuyRequest;
import io.tingkai.money.model.request.FundSellRequest;
import io.tingkai.money.model.request.FundTradeRecordEditRequest;
import io.tingkai.money.model.response.AccountResponse;
import io.tingkai.money.model.response.FundResponse;
import io.tingkai.money.model.response.StockResponse;
import io.tingkai.money.model.vo.FundRecordVo;
import io.tingkai.money.model.vo.FundVo;
import io.tingkai.money.model.vo.PredictResultVo;
import io.tingkai.money.model.vo.UserFundRecordVo;
import io.tingkai.money.model.vo.UserFundVo;
import io.tingkai.money.model.vo.UserTrackingFundVo;
import io.tingkai.money.service.DataFetcherService;
import io.tingkai.money.service.FundService;
import io.tingkai.money.service.PredictService;
import io.tingkai.money.service.UserFundService;

@RestController
@RequestMapping(value = FundController.CONROLLER_PREFIX)
public class FundController {

	public static final String CONROLLER_PREFIX = "/fund";
	public static final String GET_ALL_PATH = "/getAll";
	public static final String GET_RECORDS_PATH = "/getRecords";
	public static final String REFRESH_PATH = "/refresh";
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
	private FundService fundService;

	@Autowired
	private UserFundService userFundService;

	@Autowired
	private DataFetcherService pythonFetcherService;

	@Autowired
	private PredictService predictService;

	@RequestMapping(value = FundController.GET_ALL_PATH, method = RequestMethod.GET)
	public FundResponse<List<FundVo>> getAllFunds(@RequestParam(required = false) String code, @RequestParam(required = false) String name, @RequestParam(required = false, defaultValue = "true") boolean sort) {
		List<FundVo> funds = this.fundService.getAll(code, name, sort);
		return new FundResponse<List<FundVo>>(true, funds, MessageConstant.FUND_GET_ALL_SUCCESS);
	}

	@RequestMapping(value = FundController.GET_RECORDS_PATH, method = RequestMethod.GET)
	public FundResponse<List<FundRecordVo>> getRecords(@RequestParam String code) {
		List<FundRecordVo> records = this.fundService.getAllRecords(code);
		return new FundResponse<List<FundRecordVo>>(true, records, MessageConstant.FUND_GET_SUCCESS, code);
	}

	@RequestMapping(value = FundController.REFRESH_PATH, method = RequestMethod.POST)
	public FundResponse<Void> refresh(@RequestParam String code) {
		this.pythonFetcherService.fetchFundRecord(code);
		return new FundResponse<Void>(true, null, MessageConstant.FUND_REFRESH_SUCCESS);
	}

	@RequestMapping(value = FundController.BUY_PATH, method = RequestMethod.PUT)
	public FundResponse<UserFund> buy(@RequestBody FundBuyRequest request) throws AccountBalanceNotEnoughException, FundAmountInvalidException, NotExistException, FieldMissingException, AlreadyExistException {
		UserFund result = this.userFundService.buy(request);
		return new FundResponse<UserFund>(true, result, MessageFormat.format(MessageConstant.USER_FUND_BUY_SUCCESS, request.getFundCode(), request.getShare(), request.getPrice()));
	}

	@RequestMapping(value = FundController.SELL_PATH, method = RequestMethod.PUT)
	public FundResponse<UserFund> sell(@RequestBody FundSellRequest request) throws FundAmountInvalidException, AlreadyExistException, FieldMissingException, NotExistException {
		UserFund result = this.userFundService.sell(request);
		return new FundResponse<UserFund>(true, result, MessageFormat.format(MessageConstant.USER_FUND_SELL_SUCCESS, request.getFundCode(), request.getShare(), request.getPrice()));
	}

	@RequestMapping(value = FundController.BONUS_PATH, method = RequestMethod.PUT)
	public FundResponse<UserFund> bonus(@RequestBody FundBonusRequest request) throws FundAmountInvalidException, AlreadyExistException, FieldMissingException, NotExistException {
		UserFund result = this.userFundService.bonus(request);
		return new FundResponse<UserFund>(true, result, MessageFormat.format(MessageConstant.USER_FUND_BONUS_SUCCESS, request.getTotal(), request.getFundCode()));
	}

	@RequestMapping(value = StockController.UPDATE_RECORD_PATH, method = RequestMethod.PUT)
	public AccountResponse<UserFund> updateRecord(@RequestBody FundTradeRecordEditRequest request) throws NotExistException, FieldMissingException, StockAmountInvalidException {
		UserFund result = this.userFundService.updateRecord(request);
		return new AccountResponse<UserFund>(true, result, MessageConstant.USER_FUND_RECORD_UPDATE_SUCCESS);
	}

	@RequestMapping(value = StockController.DELETE_RECORD_PATH, method = RequestMethod.DELETE)
	public AccountResponse<Void> deleteRecord(@RequestParam UUID recordId) throws NotExistException, FieldMissingException {
		this.userFundService.reverseRecord(recordId);
		return new AccountResponse<Void>(true, null, MessageConstant.USER_FUND_RECORD_DELETE_SUCCESS);
	}

	@RequestMapping(value = FundController.GET_OWN_PATH, method = RequestMethod.GET)
	public FundResponse<List<UserFundVo>> getOwnFunds() {
		List<UserFundVo> result = this.userFundService.getOwnFunds();
		return new FundResponse<List<UserFundVo>>(true, result, MessageConstant.SUCCESS);
	}

	@RequestMapping(value = StockController.GET_OWN_RECORDS_PATH, method = RequestMethod.GET)
	public StockResponse<List<UserFundRecordVo>> getOwnStockRecords(@RequestParam UUID userFundId) {
		List<UserFundRecordVo> result = this.userFundService.getOwnFundRecords(userFundId);
		return new StockResponse<List<UserFundRecordVo>>(true, result, MessageConstant.SUCCESS);
	}

	@RequestMapping(value = FundController.GET_TRACKING_LIST_PATH, method = RequestMethod.GET)
	public FundResponse<List<UserTrackingFundVo>> getAll() {
		List<UserTrackingFundVo> funds = this.userFundService.getUserTrackingFundList();
		return new FundResponse<List<UserTrackingFundVo>>(true, funds, MessageConstant.USER_FUND_GET_TRACKING_LIST_SUCCESS);
	}

	@RequestMapping(value = FundController.TRACK_PATH, method = RequestMethod.POST)
	public FundResponse<Void> track(@RequestParam String code) throws AlreadyExistException, FieldMissingException {
		this.userFundService.track(code);
		return new FundResponse<Void>(true, null, MessageConstant.FUND_REFRESH_SUCCESS);
	}

	@RequestMapping(value = FundController.UNTRACK_PATH, method = RequestMethod.POST)
	public FundResponse<Void> untrack(@RequestParam String code) throws NotExistException {
		this.userFundService.untrack(code);
		return new FundResponse<Void>(true, null, MessageConstant.FUND_REFRESH_SUCCESS);
	}

	@RequestMapping(value = FundController.PREDICT_PATH, method = RequestMethod.GET)
	public StockResponse<List<PredictResultVo>> predict(@RequestParam String code, @RequestParam(required = false) int days) throws NotExistException {
		List<PredictResultVo> result = predictService.predictFund(code, days);
		return new StockResponse<List<PredictResultVo>>(true, result, MessageConstant.SUCCESS);
	}
}
