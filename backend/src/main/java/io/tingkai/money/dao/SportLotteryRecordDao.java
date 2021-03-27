package io.tingkai.money.dao;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import io.tingkai.money.entity.SportLotteryRecord;

/**
 * JpaRepository for sql database table 'sport_lottery_record'
 * 
 * @author tingkai
 */
@Repository
public interface SportLotteryRecordDao extends JpaRepository<SportLotteryRecord, UUID> {
}
