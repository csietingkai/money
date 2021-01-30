package io.tingkai.money.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import io.tingkai.money.constant.MessageConstant;
import io.tingkai.money.entity.UserTrackingStock;
import io.tingkai.money.model.response.StockResponse;
import io.tingkai.money.service.UserStockService;

/**
 * Simple controller for CRUD methods to postgresql
 * 
 * @author tingkai
 */
@RestController
@RequestMapping(value = UserStockController.CONROLLER_PREFIX)
public class UserStockController {

	public static final String CONROLLER_PREFIX = "/userStock";
	public static final String GET_TRACKING_LIST_PATH = "/getTrackingList";

	@Autowired
	private UserStockService usetStockService;

	@RequestMapping(value = UserStockController.GET_TRACKING_LIST_PATH, method = RequestMethod.GET)
	public StockResponse<List<UserTrackingStock>> getAll(@RequestParam String username) {
		List<UserTrackingStock> stocks = this.usetStockService.getUserTrackingStockList(username);
		return new StockResponse<List<UserTrackingStock>>(true, stocks, MessageConstant.USER_STOCK_GET_TRACKING_LIST_SUCCESS, username);
	}
}
