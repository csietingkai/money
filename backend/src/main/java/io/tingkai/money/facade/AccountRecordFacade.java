package io.tingkai.money.facade;

import java.math.BigDecimal;
import java.text.MessageFormat;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.Month;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.lang.Nullable;
import org.springframework.stereotype.Service;
import org.springframework.util.CollectionUtils;

import io.tingkai.base.model.exception.FieldMissingException;
import io.tingkai.base.model.exception.NotExistException;
import io.tingkai.base.util.BaseAppUtil;
import io.tingkai.base.util.BaseStringUtil;
import io.tingkai.money.constant.AppConstant;
import io.tingkai.money.constant.DatabaseConstant;
import io.tingkai.money.constant.MessageConstant;
import io.tingkai.money.dao.AccountRecordDao;
import io.tingkai.money.entity.AccountRecord;
import io.tingkai.money.enumeration.AccountRecordTransType;
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
		LocalDateTime startOfMonth = LocalDateTime.of(year, month, 1, 0, 0, 0, 0);
		LocalDateTime endOfMonth = null;
		if (month == 12) {
			endOfMonth = LocalDateTime.of(year, Month.DECEMBER, 31, 23, 59, 59, 999);
		} else {
			endOfMonth = LocalDateTime.of(year, month + 1, 1, 23, 59, 59, 999).minusDays(1);
		}
		List<AccountRecord> entities = this.accountRecordDao.findByTransFromInAndTransToInAndTransDateBetween(accountIds, accountIds, startOfMonth, endOfMonth);
		if (entities.size() == 0) {
			log.trace(MessageFormat.format(MessageConstant.QUERY_NO_DATA, DatabaseConstant.TABLE_ACCOUNT));
		}
		return entities;
	}

	public List<AccountRecord> queryAll(List<UUID> accountIds, @Nullable LocalDate startDate, @Nullable LocalDate endDate, @Nullable String recordType, @Nullable String desc, @Nullable List<AccountRecordTransType> amount, boolean latestFirstOrder) {
		List<AccountRecord> entities = this.accountRecordDao.findByTransFromInOrTransToIn(accountIds, accountIds);
		if (BaseAppUtil.isPresent(startDate)) {
			entities = entities.stream().filter(x -> x.getTransDate().compareTo(startDate.atStartOfDay()) >= 0).collect(Collectors.toList());
		}
		if (BaseAppUtil.isPresent(endDate)) {
			entities = entities.stream().filter(x -> x.getTransDate().compareTo(endDate.atTime(LocalTime.MAX)) <= 0).collect(Collectors.toList());
		}
		if (BaseAppUtil.isPresent(recordType)) {
			entities = entities.stream().filter(x -> BaseStringUtil.equals(recordType, x.getRecordType())).collect(Collectors.toList());
		}
		if (BaseAppUtil.isPresent(desc)) {
			entities = entities.stream().filter(x -> !BaseStringUtil.isBlank(x.getDescription()) && x.getDescription().indexOf(desc) >= 0).collect(Collectors.toList());
		}
		if (!CollectionUtils.isEmpty(amount)) {
			entities = entities.stream().filter(x -> {
				boolean hasIncome = amount.contains(AccountRecordTransType.INCOME);
				boolean hasTransfer = amount.contains(AccountRecordTransType.TRANSFER);
				boolean hasExpend = amount.contains(AccountRecordTransType.EXPEND);
				boolean isTransfer = x.getTransFrom().compareTo(x.getTransTo()) != 0;
				boolean isIncome = !isTransfer && BigDecimal.ZERO.compareTo(x.getTransAmount()) < 0;
				boolean isExpend = !isTransfer && BigDecimal.ZERO.compareTo(x.getTransAmount()) > 0;
				return (hasIncome && isIncome) || (hasTransfer && isTransfer) || (hasExpend && isExpend);
			}).collect(Collectors.toList());
		}
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
