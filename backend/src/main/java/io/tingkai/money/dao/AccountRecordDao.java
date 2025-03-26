package io.tingkai.money.dao;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import io.tingkai.money.entity.AccountRecord;

@Repository
public interface AccountRecordDao extends JpaRepository<AccountRecord, UUID> {

	public List<AccountRecord> findByIdIn(List<UUID> ids);

	public List<AccountRecord> findByTransFromInAndTransToInAndTransDateBetween(List<UUID> transFroms, List<UUID> transTos, LocalDateTime start, LocalDateTime end);

	public List<AccountRecord> findByTransFromInOrTransToIn(List<UUID> transFroms, List<UUID> transTos);
}
