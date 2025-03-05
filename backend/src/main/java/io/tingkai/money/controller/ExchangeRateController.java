package io.tingkai.money.controller;

import java.io.IOException;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import io.tingkai.base.model.exception.AlreadyExistException;
import io.tingkai.base.model.exception.FieldMissingException;
import io.tingkai.base.model.exception.NotExistException;
import io.tingkai.base.model.response.SimpleResponse;
import io.tingkai.money.constant.MessageConstant;
import io.tingkai.money.model.exception.AccountBalanceNotEnoughException;
import io.tingkai.money.model.request.ExchangeRateTradeRequest;
import io.tingkai.money.model.response.ExchangeRateResponse;
import io.tingkai.money.model.vo.ExchangeRateRecordVo;
import io.tingkai.money.model.vo.ExchangeRateVo;
import io.tingkai.money.service.DataFetcherService;
import io.tingkai.money.service.ExchangeRateService;

@RestController
@RequestMapping(value = ExchangeRateController.CONROLLER_PREFIX)
public class ExchangeRateController {

	public static final String CONROLLER_PREFIX = "/exchangeRate";
	public static final String GET_ALL_PATH = "/getAll";
	public static final String GET_RECORDS_PATH = "/getRecords";
	public static final String REFRESH_PATH = "/refresh";
	public static final String TRADE_PATH = "/trade";

	@Autowired
	private ExchangeRateService exchangeRateService;

	@Autowired
	private DataFetcherService pythonFetcherService;

	@RequestMapping(value = ExchangeRateController.GET_ALL_PATH, method = RequestMethod.GET)
	public ExchangeRateResponse<List<ExchangeRateVo>> getAll() {
		List<ExchangeRateVo> list = this.exchangeRateService.getAll();
		return new ExchangeRateResponse<List<ExchangeRateVo>>(true, list, MessageConstant.EXCHANGE_RATE_GET_ALL_SUCCESS);
	}

	@RequestMapping(value = ExchangeRateController.GET_RECORDS_PATH, method = RequestMethod.GET)
	public ExchangeRateResponse<List<ExchangeRateRecordVo>> getRecords(@RequestParam String currency) {
		List<ExchangeRateRecordVo> records = this.exchangeRateService.getAllRecords(currency);
		return new ExchangeRateResponse<List<ExchangeRateRecordVo>>(true, records, MessageConstant.EXCHANGE_RATE_GET_SUCCESS, currency);
	}

	@RequestMapping(value = ExchangeRateController.REFRESH_PATH, method = RequestMethod.POST)
	public SimpleResponse refresh(@RequestParam String currency) throws AlreadyExistException, FieldMissingException, IOException {
		this.pythonFetcherService.fetechExchangeRateRecord(currency);
		return new SimpleResponse(true);
	}

	@RequestMapping(value = ExchangeRateController.TRADE_PATH, method = RequestMethod.POST)
	public SimpleResponse trade(@RequestBody ExchangeRateTradeRequest request) throws NotExistException, FieldMissingException, AccountBalanceNotEnoughException, AlreadyExistException {
		this.exchangeRateService.trade(request);
		return new SimpleResponse(true);
	}
}
