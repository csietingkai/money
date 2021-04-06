package io.tingkai.money.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import io.tingkai.money.constant.MessageConstant;
import io.tingkai.money.model.response.EnumResponse;
import io.tingkai.money.service.EnumService;

@RestController
@RequestMapping(value = EnumController.CONTROLLER_PREFIX)
public class EnumController {

	public static final String CONTROLLER_PREFIX = "/enum";
	public static final String BET_TYPES = "/betTypes";
	public static final String DEAL_TYPES = "/dealTypes";
	public static final String LOTTERY_RESULTS = "/lotteryResults";
	public static final String MARKET_TYPES = "/marketTypes";
	public static final String ROLES = "/roles";
	public static final String SPORT_TYPES = "/sportTypes";

	@Autowired
	private EnumService enumService;

	@RequestMapping(value = EnumController.BET_TYPES, method = RequestMethod.GET)
	public EnumResponse betTypes() {
		return new EnumResponse(true, this.enumService.betTypeListMap(), MessageConstant.SUCCESS);
	}

	@RequestMapping(value = EnumController.DEAL_TYPES, method = RequestMethod.GET)
	public EnumResponse dealTypes() {
		return new EnumResponse(true, this.enumService.dealTypeListMap(), MessageConstant.SUCCESS);
	}

	@RequestMapping(value = EnumController.LOTTERY_RESULTS, method = RequestMethod.GET)
	public EnumResponse lotteryResults() {
		return new EnumResponse(true, this.enumService.lotteryResultListMap(), MessageConstant.SUCCESS);
	}

	@RequestMapping(value = EnumController.MARKET_TYPES, method = RequestMethod.GET)
	public EnumResponse marketTypes() {
		return new EnumResponse(true, this.enumService.marketTypeListMap(), MessageConstant.SUCCESS);
	}

	@RequestMapping(value = EnumController.ROLES, method = RequestMethod.GET)
	public EnumResponse roles() {
		return new EnumResponse(true, this.enumService.roleListMap(), MessageConstant.SUCCESS);
	}

	@RequestMapping(value = EnumController.SPORT_TYPES, method = RequestMethod.GET)
	public EnumResponse sportTypes() {
		return new EnumResponse(true, this.enumService.sportTypeListMap(), MessageConstant.SUCCESS);
	}
}
