package io.tingkai.money.controller;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import io.tingkai.money.constant.MessageConstant;
import io.tingkai.money.model.response.OptionResponse;
import io.tingkai.money.model.vo.ExchangeRateVo;
import io.tingkai.money.model.vo.OptionVo;
import io.tingkai.money.service.ExchangeRateService;
import io.tingkai.money.service.OptionService;

@RestController
@RequestMapping(value = OptionController.CONTROLLER_PREFIX)
public class OptionController {

	public static final String CONTROLLER_PREFIX = "/option";
	public static final String CURRENCIES_TYPES = "/currencies";
	public static final String FILE_TYPES = "/fileTypes";
	public static final String STOCK_TYPES = "/stockTypes";
	public static final String RECORD_TYPES = "/recordTypes";

	@Autowired
	private ExchangeRateService exchangeRateService;

	@Autowired
	private OptionService optionService;

	@RequestMapping(value = OptionController.CURRENCIES_TYPES, method = RequestMethod.GET)
	public OptionResponse currencies() {
		List<ExchangeRateVo> exchangeRates = this.exchangeRateService.getAll();
		List<OptionVo> options = exchangeRates.stream().map(o -> {
			return OptionVo.of(o.getCurrency(), o.getName());
		}).collect(Collectors.toList());
		return new OptionResponse(true, options, MessageConstant.SUCCESS);
	}

	@RequestMapping(value = OptionController.FILE_TYPES, method = RequestMethod.GET)
	public OptionResponse fileTypes() {
		return new OptionResponse(true, this.optionService.getFileTypeOptions(), MessageConstant.SUCCESS);
	}

	@RequestMapping(value = OptionController.STOCK_TYPES, method = RequestMethod.GET)
	public OptionResponse stockTypes() {
		return new OptionResponse(true, this.optionService.getStockTypeOptions(), MessageConstant.SUCCESS);
	}

	@RequestMapping(value = OptionController.RECORD_TYPES, method = RequestMethod.GET)
	public OptionResponse recordTypes() {
		return new OptionResponse(true, this.optionService.getRecordTypeOptions(), MessageConstant.SUCCESS);
	}
}
