package io.tingkai.money.dao;

import java.util.UUID;

import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import io.tingkai.money.entity.SportLotteryRecord;

/**
 * CrudRepository for sql database table 'sport_lottery_record'
 * 
 * @author tingkai
 */
@Repository
public interface SportLotteryRecordDao extends CrudRepository<SportLotteryRecord, UUID> {
}
