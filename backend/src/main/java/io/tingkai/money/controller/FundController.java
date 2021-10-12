package io.tingkai.money.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import io.tingkai.money.constant.MessageConstant;
import io.tingkai.money.model.exception.AlreadyExistException;
import io.tingkai.money.model.exception.FieldMissingException;
import io.tingkai.money.model.exception.NotExistException;
import io.tingkai.money.model.response.StockResponse;
import io.tingkai.money.model.vo.FundRecordVo;
import io.tingkai.money.model.vo.FundVo;
import io.tingkai.money.model.vo.UserTrackingFundVo;
import io.tingkai.money.service.DataFetcherService;
import io.tingkai.money.service.FundService;
import io.tingkai.money.service.UserFundService;

@RestController
@RequestMapping(value = FundController.CONROLLER_PREFIX)
public class FundController {

	public static final String CONROLLER_PREFIX = "/fund";
	public static final String GET_ALL_PATH = "/getAll";
	public static final String GET_RECORDS_PATH = "/getRecords";
	public static final String REFRESH_PATH = "/refresh";
	public static final String GET_TRACKING_LIST_PATH = "/getTrackingList";
	public static final String TRACK_PATH = "/track";
	public static final String UNTRACK_PATH = "/untrack";

	@Autowired
	private FundService fundService;

	@Autowired
	private UserFundService userFundService;

	@Autowired
	private DataFetcherService pythonFetcherService;

	@RequestMapping(value = FundController.GET_ALL_PATH, method = RequestMethod.GET)
	public StockResponse<List<FundVo>> getAll(@RequestParam(required = false) String code, @RequestParam(required = false) String name, @RequestParam(required = false, defaultValue = "true") boolean sort) {
		List<FundVo> funds = this.fundService.getAll(code, name, sort);
		return new StockResponse<List<FundVo>>(true, funds, MessageConstant.FUND_GET_ALL_SUCCESS);
	}

	@RequestMapping(value = FundController.GET_RECORDS_PATH, method = RequestMethod.GET)
	public StockResponse<List<FundRecordVo>> getRecords(@RequestParam String code, @RequestParam long start, @RequestParam long end) {
		List<FundRecordVo> records = this.fundService.getAllRecords(code, start, end);
		return new StockResponse<List<FundRecordVo>>(true, records, MessageConstant.FUND_GET_SUCCESS, code);
	}

	@RequestMapping(value = FundController.REFRESH_PATH, method = RequestMethod.POST)
	public StockResponse<Void> refresh(@RequestParam String code) {
		this.pythonFetcherService.fetchFundRecord(code);
		return new StockResponse<Void>(true, null, MessageConstant.FUND_REFRESH_SUCCESS);
	}

	@RequestMapping(value = FundController.GET_TRACKING_LIST_PATH, method = RequestMethod.GET)
	public StockResponse<List<UserTrackingFundVo>> getAll(@RequestParam String username) {
		List<UserTrackingFundVo> stocks = this.userFundService.getUserTrackingStockList(username);
		return new StockResponse<List<UserTrackingFundVo>>(true, stocks, MessageConstant.USER_FUND_GET_TRACKING_LIST_SUCCESS, username);
	}

	@RequestMapping(value = FundController.TRACK_PATH, method = RequestMethod.POST)
	public StockResponse<Void> track(@RequestParam String username, @RequestParam String code) throws AlreadyExistException, FieldMissingException {
		this.userFundService.track(username, code);
		return new StockResponse<Void>(true, null, MessageConstant.FUND_REFRESH_SUCCESS);
	}

	@RequestMapping(value = FundController.UNTRACK_PATH, method = RequestMethod.POST)
	public StockResponse<Void> untrack(@RequestParam String username, @RequestParam String code) throws NotExistException {
		this.userFundService.untrack(username, code);
		return new StockResponse<Void>(true, null, MessageConstant.FUND_REFRESH_SUCCESS);
	}
}
