package io.tingkai.money.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping(value = SportLotteryController.CONTROLLER_PREFIX)
public class SportLotteryController {

	public static final String CONTROLLER_PREFIX = "/sportLottery";

}
