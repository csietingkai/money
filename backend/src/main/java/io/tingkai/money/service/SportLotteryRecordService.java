package io.tingkai.money.service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import io.tingkai.money.constant.DatabaseConstants;
import io.tingkai.money.dao.SportLotteryRecordDao;
import io.tingkai.money.entity.SportLotteryRecord;
import io.tingkai.money.model.exception.AlreadyExistException;
import io.tingkai.money.model.exception.FieldMissingException;
import io.tingkai.money.model.exception.NotExistException;
import io.tingkai.money.model.exception.QueryNotResultException;
import io.tingkai.money.util.AppUtil;

/**
 * provide method for get single or multiple data from database table
 * 'sport_lottery_record'
 * 
 * @author tingkai
 */
@Service
public class SportLotteryRecordService {

	@Autowired
	private SportLotteryRecordDao sportLotteryRecordDao;

	public List<SportLotteryRecord> getAll() throws QueryNotResultException {
		List<SportLotteryRecord> entities = new ArrayList<SportLotteryRecord>();
		Iterable<SportLotteryRecord> iterable = this.sportLotteryRecordDao.findAll();
		iterable.forEach(entities::add);
		if (entities.size() == 0) {
			throw new QueryNotResultException(DatabaseConstants.TABLE_SPORT_LOTTERY_RECORD);
		}
		return entities;
	}

	public SportLotteryRecord get(UUID id) throws QueryNotResultException {
		Optional<SportLotteryRecord> optional = this.sportLotteryRecordDao.findById(id);
		if (optional.isEmpty()) {
			throw new QueryNotResultException(DatabaseConstants.TABLE_EXCHANGE_RATE_RECORD);
		}
		return optional.get();
	}

	public SportLotteryRecord insert(SportLotteryRecord entity) throws FieldMissingException {
		if (!AppUtil.isAllPresent(entity, entity.getAccountId(), entity)) {
			throw new FieldMissingException();
		}
		return this.sportLotteryRecordDao.save(entity);
	}

	public List<SportLotteryRecord> insertAll(List<SportLotteryRecord> entities) throws AlreadyExistException, FieldMissingException {
		List<SportLotteryRecord> inserted = new ArrayList<SportLotteryRecord>();
		for (SportLotteryRecord entity : entities) {
			inserted.add(this.insert(entity));
		}
		return inserted;
	}

	public void delete(UUID id) throws NotExistException {
		if (!AppUtil.isAllPresent(id)) {
			throw new NotExistException();
		}
		Optional<SportLotteryRecord> optional = this.sportLotteryRecordDao.findById(id);
		if (optional.isEmpty()) {
			throw new NotExistException();
		}
		this.sportLotteryRecordDao.delete(optional.get());
	}
}
