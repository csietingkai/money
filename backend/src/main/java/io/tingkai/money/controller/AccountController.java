package io.tingkai.money.controller;

import java.util.List;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.mongodb.lang.Nullable;

import io.tingkai.money.constant.MessageConstant;
import io.tingkai.money.entity.Account;
import io.tingkai.money.entity.AccountRecord;
import io.tingkai.money.model.exception.AccountBalanceWrongException;
import io.tingkai.money.model.exception.AlreadyExistException;
import io.tingkai.money.model.exception.FieldMissingException;
import io.tingkai.money.model.exception.NotExistException;
import io.tingkai.money.model.response.AccountResponse;
import io.tingkai.money.model.response.SimpleResponse;
import io.tingkai.money.model.vo.AccountRecordVo;
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
	public static final String INCOME_PATH = "/income";
	public static final String TRANSFER_PATH = "/transfer";
	public static final String EXPEND_PATH = "/expend";

	@Autowired
	private AccountService accountService;

	@RequestMapping(value = AccountController.GET_ALL_PATH, method = RequestMethod.GET)
	public AccountResponse<List<Account>> getAccounts(@RequestParam String ownerName) {
		List<Account> entities = this.accountService.getAll(ownerName);
		return new AccountResponse<List<Account>>(true, entities, MessageConstant.ACCOUNT_GET_ALL_SUCCESS, ownerName);
	}

	@RequestMapping(value = AccountController.INSERT_PATH, method = RequestMethod.POST)
	public AccountResponse<Account> insert(@RequestBody Account entity) throws AlreadyExistException, FieldMissingException {
		Account inserted = this.accountService.insert(entity);
		return new AccountResponse<Account>(true, inserted, MessageConstant.ACCOUNT_INSERT_SUCCESS, entity.getName(), entity.getOwnerName());
	}

	@RequestMapping(value = AccountController.UPDATE_PATH, method = RequestMethod.PUT)
	public AccountResponse<Account> update(@RequestBody Account entity) throws NotExistException, FieldMissingException {
		Account updated = this.accountService.update(entity);
		return new AccountResponse<Account>(true, updated, MessageConstant.ACCOUNT_UPDATE_SUCCESS, entity.getName(), entity.getOwnerName());
	}

	@RequestMapping(value = AccountController.DELETE_PATH, method = RequestMethod.DELETE)
	public SimpleResponse delete(@RequestParam UUID id) throws NotExistException {
		this.accountService.delete(id);
		return new SimpleResponse(true);
	}

	@RequestMapping(value = AccountController.GET_RECORDS_PATH, method = RequestMethod.GET)
	public AccountResponse<List<AccountRecordVo>> getRecords(@RequestParam UUID accountId, @Nullable @RequestParam(defaultValue = "true") boolean latestFirstOrder) {
		List<AccountRecordVo> entities = this.accountService.getAllRecords(accountId, latestFirstOrder);
		return new AccountResponse<List<AccountRecordVo>>(true, entities, MessageConstant.ACCOUNT_GET_RECORDS_SUCCESS, accountId.toString());
	}

	@RequestMapping(value = AccountController.INCOME_PATH, method = RequestMethod.POST)
	public AccountResponse<AccountRecord> income(@RequestParam UUID accountId, @RequestBody AccountRecord entity) throws AccountBalanceWrongException, AlreadyExistException, NotExistException, FieldMissingException {
		AccountRecord inserted = this.accountService.income(entity, accountId);
		return new AccountResponse<AccountRecord>(true, inserted, MessageConstant.ACCOUNT_INSERT_RECORDS_SUCCESS, entity.getId().toString());
	}

	@RequestMapping(value = AccountController.TRANSFER_PATH, method = RequestMethod.POST)
	public AccountResponse<AccountRecord> transfer(@RequestParam UUID accountId, @RequestBody AccountRecord entity) throws AccountBalanceWrongException, AlreadyExistException, NotExistException, FieldMissingException {
		AccountRecord inserted = this.accountService.transfer(entity, accountId);
		return new AccountResponse<AccountRecord>(true, inserted, MessageConstant.ACCOUNT_INSERT_RECORDS_SUCCESS, entity.getId().toString());
	}

	@RequestMapping(value = AccountController.EXPEND_PATH, method = RequestMethod.POST)
	public AccountResponse<AccountRecord> expend(@RequestParam UUID accountId, @RequestBody AccountRecord entity) throws AccountBalanceWrongException, AlreadyExistException, NotExistException, FieldMissingException {
		AccountRecord inserted = this.accountService.expend(entity, accountId);
		return new AccountResponse<AccountRecord>(true, inserted, MessageConstant.ACCOUNT_INSERT_RECORDS_SUCCESS, entity.getId().toString());
	}
}
