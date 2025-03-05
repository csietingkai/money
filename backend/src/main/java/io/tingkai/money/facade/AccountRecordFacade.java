package io.tingkai.money.facade;

import java.text.MessageFormat;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.Month;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import io.tingkai.base.model.exception.FieldMissingException;
import io.tingkai.base.model.exception.NotExistException;
import io.tingkai.base.util.BaseAppUtil;
import io.tingkai.money.constant.AppConstant;
import io.tingkai.money.constant.DatabaseConstant;
import io.tingkai.money.constant.MessageConstant;
import io.tingkai.money.dao.AccountRecordDao;
import io.tingkai.money.entity.AccountRecord;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class AccountRecordFacade {

	@Autowired
	private AccountRecordDao accountRecordDao;

	public List<AccountRecord> queryAll(List<UUID> ids) {
		List<AccountRecord> entities = this.accountRecordDao.findByIdIn(ids);
		if (entities.size() == 0) {
			log.trace(MessageFormat.format(MessageConstant.QUERY_NO_DATA, DatabaseConstant.TABLE_ACCOUNT));
		}
		if (entities.size() > AppConstant.FETCH_MAX_RECORD) {
			entities = entities.subList(0, AppConstant.FETCH_MAX_RECORD);
		}
		return entities;
	}

	public List<AccountRecord> queryAllInMonth(List<UUID> accountIds, int year, int month) {
		LocalDateTime startOfMonth = LocalDateTime.of(year, month, 1, 0, 0);
		LocalDateTime endOfMonth = null;
		if (month == 12) {
			endOfMonth = LocalDate.of(year, Month.DECEMBER, 31).atTime(LocalTime.MAX);
		} else {
			endOfMonth = LocalDate.of(year, month + 1, 1).minusDays(1).atTime(LocalTime.MAX);
		}
		List<AccountRecord> entities = this.accountRecordDao.findByTransFromInAndTransToInAndTransDateBetween(accountIds, accountIds, startOfMonth, endOfMonth);
		if (entities.size() == 0) {
			log.trace(MessageFormat.format(MessageConstant.QUERY_NO_DATA, DatabaseConstant.TABLE_ACCOUNT));
		}
		return entities;
	}

	public List<AccountRecord> queryAll(UUID accountId, boolean latestFirstOrder) {
		List<AccountRecord> entities = this.accountRecordDao.findByTransFromOrTransTo(accountId, accountId);
		if (entities.size() == 0) {
			log.trace(MessageFormat.format(MessageConstant.QUERY_NO_DATA, DatabaseConstant.TABLE_ACCOUNT));
		}
		if (latestFirstOrder) {
			entities.sort((AccountRecord a, AccountRecord b) -> {
				return b.getTransDate().compareTo(a.getTransDate());
			});
		}
		if (entities.size() > AppConstant.FETCH_MAX_RECORD) {
			entities = entities.subList(0, AppConstant.FETCH_MAX_RECORD);
		}
		return entities;
	}

	public AccountRecord query(UUID id) {
		Optional<AccountRecord> optional = this.accountRecordDao.findById(id);
		if (optional.isEmpty()) {
			log.trace(MessageFormat.format(MessageConstant.QUERY_NO_DATA, DatabaseConstant.TABLE_ACCOUNT));
		}
		return optional.get();
	}

	public AccountRecord insert(AccountRecord entity) throws FieldMissingException {
		if (!BaseAppUtil.isAllPresent(entity, entity.getTransDate(), entity.getTransAmount(), entity.getTransFrom(), entity.getTransTo(), entity.getRecordType())) {
			throw new FieldMissingException();
		}
		return this.accountRecordDao.save(entity);
	}

	public AccountRecord update(AccountRecord entity) throws NotExistException, FieldMissingException {
		if (!BaseAppUtil.isAllPresent(entity, entity.getId(), entity.getTransDate(), entity.getTransAmount(), entity.getTransFrom(), entity.getTransTo(), entity.getRecordType())) {
			throw new FieldMissingException();
		}
		Optional<AccountRecord> optional = this.accountRecordDao.findById(entity.getId());
		if (optional.isEmpty()) {
			throw new NotExistException();
		}
		AccountRecord updateEntity = optional.get();
		updateEntity.setTransDate(entity.getTransDate());
		updateEntity.setTransAmount(entity.getTransAmount());
		updateEntity.setTransFrom(entity.getTransFrom());
		updateEntity.setTransTo(entity.getTransTo());
		updateEntity.setDescription(entity.getDescription());
		updateEntity.setFileId(entity.getFileId());
		return this.accountRecordDao.save(updateEntity);
	}

	public void delete(UUID id) throws NotExistException {
		if (!BaseAppUtil.isAllPresent(id)) {
			throw new NotExistException();
		}
		Optional<AccountRecord> optional = this.accountRecordDao.findById(id);
		if (optional.isEmpty()) {
			throw new NotExistException();
		}
		this.accountRecordDao.delete(optional.get());
	}
}
