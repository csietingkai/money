package io.tingkai.money.controller;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import io.tingkai.base.model.exception.AlreadyExistException;
import io.tingkai.base.model.exception.FieldMissingException;
import io.tingkai.base.model.exception.NotExistException;
import io.tingkai.base.model.response.BaseResponse;
import io.tingkai.base.model.response.SimpleResponse;
import io.tingkai.money.constant.MessageConstant;
import io.tingkai.money.entity.Account;
import io.tingkai.money.entity.AccountRecord;
import io.tingkai.money.enumeration.AccountRecordTransType;
import io.tingkai.money.model.exception.AccountBalanceNotEnoughException;
import io.tingkai.money.model.exception.AccountBalanceWrongException;
import io.tingkai.money.model.request.AccountEditRequest;
import io.tingkai.money.model.request.AccountInsertRequest;
import io.tingkai.money.model.request.AccountRecordEditRequest;
import io.tingkai.money.model.request.AccountRecordExpendRequest;
import io.tingkai.money.model.request.AccountRecordIncomeRequest;
import io.tingkai.money.model.request.AccountRecordTransferRequest;
import io.tingkai.money.model.vo.AccountRecordVo;
import io.tingkai.money.model.vo.AccountVo;
import io.tingkai.money.model.vo.MonthBalanceVo;
import io.tingkai.money.service.AccountService;

@RestController
@RequestMapping(value = AccountController.CONTROLLER_PREFIX)
public class AccountController {

	public static final String CONTROLLER_PREFIX = "/account";
	public static final String GET_ALL_PATH = "/getAll";
	public static final String INSERT_PATH = "/insert";
	public static final String UPDATE_PATH = "/update";
	public static final String DELETE_PATH = "/delete";
	public static final String GET_RECORDS_PATH = "/getRecords";
	public static final String GET_RECORD_PATH = "/getRecord";
	public static final String MONTH_BALANCE = "/monthBalance";
	public static final String INCOME_PATH = "/income";
	public static final String TRANSFER_PATH = "/transfer";
	public static final String EXPEND_PATH = "/expend";
	public static final String UPDATE_RECORD_PATH = "/updateRecord";
	public static final String DELETE_RECORD_PATH = "/deleteRecord";

	@Autowired
	private AccountService accountService;

	@RequestMapping(value = AccountController.GET_ALL_PATH, method = RequestMethod.GET)
	public BaseResponse<List<AccountVo>> getAccounts() {
		List<AccountVo> entities = this.accountService.getAll();
		return new BaseResponse<List<AccountVo>>(true, entities, MessageConstant.ACCOUNT_GET_ALL_SUCCESS);
	}

	@RequestMapping(value = AccountController.INSERT_PATH, method = RequestMethod.POST)
	public BaseResponse<Account> insert(@RequestBody AccountInsertRequest req) throws AlreadyExistException, FieldMissingException {
		Account inserted = this.accountService.insert(req);
		return new BaseResponse<Account>(true, inserted, MessageConstant.ACCOUNT_INSERT_SUCCESS, inserted.getName());
	}

	@RequestMapping(value = AccountController.UPDATE_PATH, method = RequestMethod.PUT)
	public BaseResponse<Account> update(@RequestBody AccountEditRequest req) throws NotExistException, FieldMissingException {
		Account updated = this.accountService.update(req);
		return new BaseResponse<Account>(true, updated, MessageConstant.ACCOUNT_UPDATE_SUCCESS, updated.getName());
	}

	@RequestMapping(value = AccountController.DELETE_PATH, method = RequestMethod.DELETE)
	public SimpleResponse remove(@RequestParam UUID id) {
		this.accountService.remove(id);
		return new SimpleResponse(true, MessageConstant.ACCOUNT_DELETE_SUCCESS);
	}

	@RequestMapping(value = AccountController.GET_RECORDS_PATH, method = RequestMethod.GET)
	public BaseResponse<List<AccountRecordVo>> getRecords(@RequestParam(required = false) UUID accountId, @RequestParam(required = false) LocalDate startDate, @RequestParam(required = false) LocalDate endDate, @RequestParam(required = false) String recordType, @RequestParam(required = false) String desc, @RequestParam(required = false) List<AccountRecordTransType> amount, @RequestParam(defaultValue = "true") boolean latestFirstOrder) {
		List<AccountRecordVo> entities = this.accountService.getAllRecords(accountId, startDate, endDate, recordType, desc, amount, latestFirstOrder);
		return new BaseResponse<List<AccountRecordVo>>(true, entities, MessageConstant.ACCOUNT_GET_RECORDS_SUCCESS);
	}

	@RequestMapping(value = AccountController.GET_RECORD_PATH, method = RequestMethod.GET)
	public BaseResponse<AccountRecordVo> getRecord(@RequestParam UUID recordId) {
		AccountRecordVo entity = this.accountService.getRecord(recordId);
		return new BaseResponse<AccountRecordVo>(true, entity, MessageConstant.SUCCESS);
	}

	@RequestMapping(value = AccountController.MONTH_BALANCE, method = RequestMethod.GET)
	public BaseResponse<MonthBalanceVo> getMonthBalance(@RequestParam int cnt) {
		MonthBalanceVo vo = this.accountService.getAllRecordInMonth(cnt);
		return new BaseResponse<MonthBalanceVo>(true, vo, MessageConstant.ACCOUNT_GET_MONTH_BALANCE_SUCCESS);
	}

	@RequestMapping(value = AccountController.INCOME_PATH, method = RequestMethod.POST)
	public BaseResponse<AccountRecord> income(@RequestBody AccountRecordIncomeRequest request) throws AccountBalanceWrongException, AlreadyExistException, NotExistException, FieldMissingException {
		AccountRecord inserted = this.accountService.income(request);
		return new BaseResponse<AccountRecord>(true, inserted, MessageConstant.ACCOUNT_INSERT_RECORDS_SUCCESS, inserted.getId().toString());
	}

	@RequestMapping(value = AccountController.TRANSFER_PATH, method = RequestMethod.POST)
	public BaseResponse<AccountRecord> transfer(@RequestBody AccountRecordTransferRequest request) throws AccountBalanceWrongException, AlreadyExistException, NotExistException, FieldMissingException, AccountBalanceNotEnoughException {
		AccountRecord inserted = this.accountService.transfer(request);
		return new BaseResponse<AccountRecord>(true, inserted, MessageConstant.ACCOUNT_INSERT_RECORDS_SUCCESS, inserted.getId().toString());
	}

	@RequestMapping(value = AccountController.EXPEND_PATH, method = RequestMethod.POST)
	public BaseResponse<AccountRecord> expend(@RequestBody AccountRecordExpendRequest request) throws AccountBalanceWrongException, AlreadyExistException, NotExistException, FieldMissingException {
		AccountRecord inserted = this.accountService.expend(request);
		return new BaseResponse<AccountRecord>(true, inserted, MessageConstant.ACCOUNT_INSERT_RECORDS_SUCCESS, inserted.getId().toString());
	}

	@RequestMapping(value = AccountController.UPDATE_RECORD_PATH, method = RequestMethod.PUT)
	public SimpleResponse updateRecord(@RequestBody AccountRecordEditRequest request) throws NotExistException, FieldMissingException {
		this.accountService.editRecord(request);
		return new SimpleResponse(true, MessageConstant.ACCOUNT_RECORD_UPDATE_SUCCESS);
	}

	@RequestMapping(value = AccountController.DELETE_RECORD_PATH, method = RequestMethod.DELETE)
	public SimpleResponse deleteRecord(@RequestParam UUID recordId) throws NotExistException, FieldMissingException {
		this.accountService.reverseRecord(recordId);
		return new SimpleResponse(true, MessageConstant.ACCOUNT_RECORD_DELETE_SUCCESS);
	}
}
