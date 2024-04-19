package io.tingkai.money.controller;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.mongodb.lang.Nullable;

import io.tingkai.money.constant.MessageConstant;
import io.tingkai.money.entity.Account;
import io.tingkai.money.entity.AccountRecord;
import io.tingkai.money.model.exception.AccountBalanceNotEnoughException;
import io.tingkai.money.model.exception.AccountBalanceWrongException;
import io.tingkai.money.model.exception.AlreadyExistException;
import io.tingkai.money.model.exception.FieldMissingException;
import io.tingkai.money.model.exception.NotExistException;
import io.tingkai.money.model.response.AccountResponse;
import io.tingkai.money.model.vo.AccountRecordVo;
import io.tingkai.money.model.vo.MonthBalanceVo;
import io.tingkai.money.service.AccountService;
import io.tingkai.money.util.TimeUtil;

@RestController
@RequestMapping(value = AccountController.CONTROLLER_PREFIX)
public class AccountController {

	public static final String CONTROLLER_PREFIX = "/account";
	public static final String GET_ALL_PATH = "/getAll";
	public static final String INSERT_PATH = "/insert";
	public static final String UPDATE_PATH = "/update";
	public static final String GET_RECORDS_PATH = "/getRecords";
	public static final String MONTH_BALANCE = "/monthBalance";
	public static final String INCOME_PATH = "/income";
	public static final String TRANSFER_PATH = "/transfer";
	public static final String EXPEND_PATH = "/expend";
	public static final String DELETE_RECORD_PATH = "/deleteRecord";

	@Autowired
	private AccountService accountService;

	@RequestMapping(value = AccountController.GET_ALL_PATH, method = RequestMethod.GET)
	public AccountResponse<List<Account>> getAccounts(@RequestParam UUID userId) {
		List<Account> entities = this.accountService.getAll(userId);
		return new AccountResponse<List<Account>>(true, entities, MessageConstant.ACCOUNT_GET_ALL_SUCCESS);
	}

	@RequestMapping(value = AccountController.INSERT_PATH, method = RequestMethod.POST)
	public AccountResponse<Account> insert(@RequestParam String name, @RequestParam String currency) throws AlreadyExistException, FieldMissingException {
		Account inserted = this.accountService.insert(name, currency);
		return new AccountResponse<Account>(true, inserted, MessageConstant.ACCOUNT_INSERT_SUCCESS, inserted.getName());
	}

	@RequestMapping(value = AccountController.UPDATE_PATH, method = RequestMethod.PUT)
	public AccountResponse<Account> update(@RequestParam UUID id, @RequestParam String name) throws NotExistException, FieldMissingException {
		Account updated = this.accountService.update(id, name);
		return new AccountResponse<Account>(true, updated, MessageConstant.ACCOUNT_UPDATE_SUCCESS, updated.getName());
	}

	@RequestMapping(value = AccountController.GET_RECORDS_PATH, method = RequestMethod.GET)
	public AccountResponse<List<AccountRecordVo>> getRecords(@RequestParam UUID accountId, @Nullable @RequestParam(defaultValue = "true") boolean latestFirstOrder) {
		List<AccountRecordVo> entities = this.accountService.getAllRecords(accountId, latestFirstOrder);
		return new AccountResponse<List<AccountRecordVo>>(true, entities, MessageConstant.ACCOUNT_GET_RECORDS_SUCCESS, accountId.toString());
	}

	@RequestMapping(value = AccountController.MONTH_BALANCE, method = RequestMethod.GET)
	public AccountResponse<MonthBalanceVo> getMonthBalance(@RequestParam UUID userId, @RequestParam int year, @RequestParam int month) {
		MonthBalanceVo vo = this.accountService.getAllRecordInMonth(userId, year, month);
		return new AccountResponse<MonthBalanceVo>(true, vo, MessageConstant.ACCOUNT_GET_MONTH_BALANCE_SUCCESS);
	}

	@RequestMapping(value = AccountController.INCOME_PATH, method = RequestMethod.POST)
	public AccountResponse<AccountRecord> income(@RequestParam UUID accountId, @RequestParam String date, @RequestParam BigDecimal amount, @RequestParam String type, @RequestParam String description, @RequestParam(required = false) UUID fileId) throws AccountBalanceWrongException, AlreadyExistException, NotExistException, FieldMissingException {
		AccountRecord inserted = this.accountService.income(accountId, TimeUtil.handleRequestDate(date), amount, type, description, fileId);
		return new AccountResponse<AccountRecord>(true, inserted, MessageConstant.ACCOUNT_INSERT_RECORDS_SUCCESS, inserted.getId().toString());
	}

	@RequestMapping(value = AccountController.TRANSFER_PATH, method = RequestMethod.POST)
	public AccountResponse<AccountRecord> transfer(@RequestParam UUID fromId, @RequestParam UUID toId, @RequestParam String date, @RequestParam BigDecimal amount, @RequestParam String type, @RequestParam String description, @RequestParam(required = false) UUID fileId) throws AccountBalanceWrongException, AlreadyExistException, NotExistException, FieldMissingException, AccountBalanceNotEnoughException {
		AccountRecord inserted = this.accountService.transfer(fromId, toId, TimeUtil.handleRequestDate(date), amount, type, description, fileId);
		return new AccountResponse<AccountRecord>(true, inserted, MessageConstant.ACCOUNT_INSERT_RECORDS_SUCCESS, inserted.getId().toString());
	}

	@RequestMapping(value = AccountController.EXPEND_PATH, method = RequestMethod.POST)
	public AccountResponse<AccountRecord> expend(@RequestParam UUID accountId, @RequestParam String date, @RequestParam BigDecimal amount, @RequestParam String type, @RequestParam String description, @RequestParam(required = false) UUID fileId) throws AccountBalanceWrongException, AlreadyExistException, NotExistException, FieldMissingException {
		AccountRecord inserted = this.accountService.expend(accountId, TimeUtil.handleRequestDate(date), amount, type, description, fileId);
		return new AccountResponse<AccountRecord>(true, inserted, MessageConstant.ACCOUNT_INSERT_RECORDS_SUCCESS, inserted.getId().toString());
	}

	@RequestMapping(value = AccountController.DELETE_RECORD_PATH, method = RequestMethod.DELETE)
	public AccountResponse<Void> deleteRecord(@RequestParam UUID recordId) throws NotExistException, FieldMissingException {
		this.accountService.reverseRecord(recordId);
		return new AccountResponse<Void>(true, null, MessageConstant.ACCOUNT_RECORD_DELETE_SUCCESS);
	}
}
