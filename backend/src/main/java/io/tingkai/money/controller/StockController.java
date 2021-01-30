package io.tingkai.money.controller;

import java.util.List;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import io.tingkai.money.constant.MessageConstant;
import io.tingkai.money.entity.Stock;
import io.tingkai.money.model.response.StockResponse;
import io.tingkai.money.service.StockService;

/**
 * Simple controller for CRUD methods to postgresql
 * 
 * @author tingkai
 */
@RestController
@RequestMapping(value = StockController.CONROLLER_PREFIX)
public class StockController {

	public static final String CONROLLER_PREFIX = "/stock";
	public static final String GET_ALL_PATH = "/getAll";
	public static final String GET_PATH = "/get";
	public static final String REFRESH_PATH = "/refresh";

	@Autowired
	private StockService stockService;

	@RequestMapping(value = StockController.GET_ALL_PATH, method = RequestMethod.GET)
	public StockResponse<List<Stock>> getAll() {
		List<Stock> stocks = this.stockService.getAll();
		return new StockResponse<List<Stock>>(true, stocks, MessageConstant.STOCK_GET_ALL_SUCCESS);
	}

	@RequestMapping(value = StockController.GET_PATH, params = "id", method = RequestMethod.GET)
	public StockResponse<Stock> get(@RequestParam UUID id) {
		Stock stock = this.stockService.get(id);
		return new StockResponse<Stock>(true, stock, MessageConstant.STOCK_GET_SUCCESS, stock.getName());
	}

	@RequestMapping(value = StockController.GET_PATH, params = "code", method = RequestMethod.GET)
	public StockResponse<Stock> get(@RequestParam String code) {
		Stock stock = this.stockService.get(code);
		return new StockResponse<Stock>(true, stock, MessageConstant.STOCK_GET_SUCCESS, stock.getName());
	}
}
