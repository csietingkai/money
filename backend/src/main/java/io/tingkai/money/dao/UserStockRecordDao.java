package io.tingkai.money.dao;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import io.tingkai.money.entity.UserStockRecord;

@Repository
public interface UserStockRecordDao extends JpaRepository<UserStockRecord, UUID> {

	public Iterable<UserStockRecord> findByUserStockIdIn(List<UUID> userStockIds);

	public Iterable<UserStockRecord> findByUserStockId(UUID userStockId);

	public Iterable<UserStockRecord> findByAccountId(UUID accountId);
}
