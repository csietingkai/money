package io.tingkai.money.service;

import java.util.List;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import io.tingkai.money.entity.SportLotteryRecord;
import io.tingkai.money.enumeration.LotteryResult;
import io.tingkai.money.facade.SportLotteryRecordFacade;
import io.tingkai.money.model.exception.FieldMissingException;
import io.tingkai.money.model.exception.NotExistException;
import io.tingkai.money.model.exception.QueryNotResultException;

@Service
public class SportLotteryService {

	@Autowired
	private SportLotteryRecordFacade sportLotteryRecordFacade;

	public List<SportLotteryRecord> getAll() throws QueryNotResultException {
		return this.sportLotteryRecordFacade.queryAll();
	}

	public SportLotteryRecord buy(SportLotteryRecord entity) throws FieldMissingException {
		return this.sportLotteryRecordFacade.insert(entity);
	}

	public SportLotteryRecord result(UUID id, LotteryResult result) throws QueryNotResultException, NotExistException, FieldMissingException {
		SportLotteryRecord entity = this.sportLotteryRecordFacade.query(id);
		entity.setResult(result);
		return this.sportLotteryRecordFacade.update(entity);
	}
}
