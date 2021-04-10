package io.tingkai.money.facade;

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

@Service
public class SportLotteryRecordFacade {

	@Autowired
	private SportLotteryRecordDao sportLotteryRecordDao;

	public List<SportLotteryRecord> queryAll() throws QueryNotResultException {
		List<SportLotteryRecord> entities = new ArrayList<SportLotteryRecord>();
		Iterable<SportLotteryRecord> iterable = this.sportLotteryRecordDao.findAll();
		iterable.forEach(entities::add);
		if (entities.size() == 0) {
			throw new QueryNotResultException(DatabaseConstants.TABLE_SPORT_LOTTERY_RECORD);
		}
		return entities;
	}

	public SportLotteryRecord query(UUID id) throws QueryNotResultException {
		Optional<SportLotteryRecord> optional = this.sportLotteryRecordDao.findById(id);
		if (optional.isEmpty()) {
			throw new QueryNotResultException(DatabaseConstants.TABLE_EXCHANGE_RATE_RECORD);
		}
		return optional.get();
	}

	public SportLotteryRecord insert(SportLotteryRecord entity) throws FieldMissingException {
		if (!AppUtil.isAllPresent(entity, entity.getAccountId())) {
			throw new FieldMissingException();
		}
		return this.sportLotteryRecordDao.save(entity);
	}

	public List<SportLotteryRecord> insertAll(List<SportLotteryRecord> entities) throws AlreadyExistException, FieldMissingException {
		long hasFieldMissingCount = entities.stream().filter(entity -> !AppUtil.isAllPresent(entity, entity.getAccountId())).count();
		if (hasFieldMissingCount > 0L) {
			throw new FieldMissingException();
		}
		return this.sportLotteryRecordDao.saveAll(entities);
	}

	public SportLotteryRecord update(SportLotteryRecord entity) throws NotExistException, FieldMissingException {
		if (!AppUtil.isAllPresent(entity, entity.getId())) {
			throw new FieldMissingException();
		}
		Optional<SportLotteryRecord> optional = this.sportLotteryRecordDao.findById(entity.getId());
		if (optional.isEmpty()) {
			throw new NotExistException();
		}
		SportLotteryRecord updateEntity = optional.get();
		updateEntity.setAccountId(entity.getAccountId());
		updateEntity.setSportType(entity.getSportType());
		updateEntity.setStake(entity.getStake());
		updateEntity.setOdds(entity.getOdds());
		updateEntity.setDate(entity.getDate());
		updateEntity.setBetType(entity.getBetType());
		updateEntity.setPointSpread(entity.getPointSpread());
		updateEntity.setResult(entity.getResult());
		return this.sportLotteryRecordDao.save(updateEntity);
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
