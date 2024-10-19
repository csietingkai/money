package io.tingkai.money.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import io.tingkai.money.constant.MessageConstant;
import io.tingkai.money.entity.BankInfo;
import io.tingkai.money.model.response.BankInfoResponse;
import io.tingkai.money.service.BankInfoService;

@RestController
@RequestMapping(value = BankInfoController.CONROLLER_PREFIX)
public class BankInfoController {

	public static final String CONROLLER_PREFIX = "/bankInfo";
	public static final String GET_ALL_PATH = "/getAll";

	@Autowired
	private BankInfoService bankInfoService;

	@RequestMapping(value = BankInfoController.GET_ALL_PATH, method = RequestMethod.GET)
	public BankInfoResponse<List<BankInfo>> getAll() {
		List<BankInfo> list = this.bankInfoService.getAll();
		return new BankInfoResponse<List<BankInfo>>(true, list, MessageConstant.BANK_INFO_GET_ALL_SUCCESS);
	}
}
