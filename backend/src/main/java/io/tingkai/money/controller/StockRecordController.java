package io.tingkai.money.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import io.tingkai.money.constant.MessageConstant;
import io.tingkai.money.entity.StockRecord;
import io.tingkai.money.model.response.StockResponse;
import io.tingkai.money.service.StockRecordService;

/**
 * Simple controller for CRUD methods to postgresql
 * 
 * @author tingkai
 */
@RestController
@RequestMapping(value = StockRecordController.CONROLLER_PREFIX)
public class StockRecordController {

	public static final String CONROLLER_PREFIX = "/stockRecord";
	public static final String GET_PATH = "/get";

	@Autowired
	private StockRecordService stockRecordService;

	@RequestMapping(value = StockRecordController.GET_PATH, method = RequestMethod.GET)
	public StockResponse<List<StockRecord>> get(@RequestParam String code) {
		List<StockRecord> records = this.stockRecordService.get(code);
		return new StockResponse<List<StockRecord>>(true, records, MessageConstant.STOCK_GET_SUCCESS, code);
	}

	@RequestMapping(value = StockRecordController.GET_PATH, params = { "code", "start", "end" }, method = RequestMethod.GET)
	public StockResponse<List<StockRecord>> get(@RequestParam String code, @RequestParam long start, @RequestParam long end) {
		List<StockRecord> records = this.stockRecordService.get(code, start, end);
		return new StockResponse<List<StockRecord>>(true, records, MessageConstant.STOCK_GET_SUCCESS, code);
	}
}
