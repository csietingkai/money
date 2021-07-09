package io.tingkai.money.controller;

import java.io.IOException;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import io.tingkai.money.constant.MessageConstant;
import io.tingkai.money.entity.ExchangeRate;
import io.tingkai.money.entity.ExchangeRateRecord;
import io.tingkai.money.model.exception.AlreadyExistException;
import io.tingkai.money.model.exception.FieldMissingException;
import io.tingkai.money.model.exception.QueryNotResultException;
import io.tingkai.money.model.response.ExchangeRateResponse;
import io.tingkai.money.model.response.SimpleResponse;
import io.tingkai.money.model.response.StockResponse;
import io.tingkai.money.service.DataFetcherService;
import io.tingkai.money.service.ExchangeRateService;

@RestController
@RequestMapping(value = ExchangeRateController.CONROLLER_PREFIX)
public class ExchangeRateController {

	public static final String CONROLLER_PREFIX = "/exchangeRate";
	public static final String GET_ALL_PATH = "/getAll";
	public static final String GET_RECORDS_PATH = "/getRecords";
	public static final String REFRESH_PATH = "/refresh";

	@Autowired
	private ExchangeRateService exchangeRateService;

	@Autowired
	private DataFetcherService pythonFetcherService;

	@RequestMapping(value = ExchangeRateController.GET_ALL_PATH, method = RequestMethod.GET)
	public ExchangeRateResponse<List<ExchangeRate>> getAll() throws QueryNotResultException {
		List<ExchangeRate> list = this.exchangeRateService.getAll();
		return new ExchangeRateResponse<List<ExchangeRate>>(true, list, MessageConstant.EXCHANGE_RATE_GET_ALL_SUCCESS);
	}

	@RequestMapping(value = ExchangeRateController.GET_RECORDS_PATH, method = RequestMethod.GET)
	public StockResponse<List<ExchangeRateRecord>> getRecords(@RequestParam String currency, @RequestParam long start, @RequestParam long end) throws QueryNotResultException {
		List<ExchangeRateRecord> records = this.exchangeRateService.getAllRecords(currency, start, end);
		return new StockResponse<List<ExchangeRateRecord>>(true, records, MessageConstant.EXCHANGE_RATE_GET_SUCCESS, currency);
	}

	@RequestMapping(value = ExchangeRateController.REFRESH_PATH, method = RequestMethod.POST)
	public SimpleResponse refresh(@RequestParam String currency) throws AlreadyExistException, FieldMissingException, IOException {
		this.pythonFetcherService.fetechExchangeRateRecord(currency);
		return new SimpleResponse(true);
	}
}
