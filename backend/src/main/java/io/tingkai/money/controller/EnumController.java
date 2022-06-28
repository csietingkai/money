package io.tingkai.money.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import io.tingkai.money.constant.MessageConstant;
import io.tingkai.money.enumeration.DealType;
import io.tingkai.money.enumeration.MarketType;
import io.tingkai.money.enumeration.RecordType;
import io.tingkai.money.enumeration.Role;
import io.tingkai.money.model.response.EnumResponse;

@RestController
@RequestMapping(value = EnumController.CONTROLLER_PREFIX)
public class EnumController {

	public static final String CONTROLLER_PREFIX = "/enum";
	public static final String DEAL_TYPES = "/dealTypes";
	public static final String MARKET_TYPES = "/marketTypes";
	public static final String ROLES = "/roles";
	public static final String RECORD_TYPES = "/recordTypes";

	@RequestMapping(value = EnumController.DEAL_TYPES, method = RequestMethod.GET)
	public EnumResponse<DealType[]> dealTypes() {
		return new EnumResponse<DealType[]>(true, DealType.values(), MessageConstant.SUCCESS);
	}

	@RequestMapping(value = EnumController.MARKET_TYPES, method = RequestMethod.GET)
	public EnumResponse<MarketType[]> marketTypes() {
		return new EnumResponse<MarketType[]>(true, MarketType.values(), MessageConstant.SUCCESS);
	}

	@RequestMapping(value = EnumController.ROLES, method = RequestMethod.GET)
	public EnumResponse<Role[]> roles() {
		return new EnumResponse<Role[]>(true, Role.values(), MessageConstant.SUCCESS);
	}

	@RequestMapping(value = EnumController.RECORD_TYPES, method = RequestMethod.GET)
	public EnumResponse<RecordType[]> recordTypes() {
		return new EnumResponse<RecordType[]>(true, RecordType.values(), MessageConstant.SUCCESS);
	}
}
