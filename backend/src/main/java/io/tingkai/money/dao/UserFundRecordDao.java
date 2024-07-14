package io.tingkai.money.dao;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import io.tingkai.money.entity.UserFundRecord;

@Repository
public interface UserFundRecordDao extends JpaRepository<UserFundRecord, UUID> {

	public List<UserFundRecord> findByUserFundIdIn(List<UUID> userFundIds);

	public List<UserFundRecord> findByUserFundId(UUID userFundId);

	public List<UserFundRecord> findByAccountRecordId(UUID accountRecordId);
}
