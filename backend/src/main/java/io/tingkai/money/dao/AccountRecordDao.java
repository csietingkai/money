package io.tingkai.money.dao;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import io.tingkai.money.entity.AccountRecord;

@Repository
public interface AccountRecordDao extends JpaRepository<AccountRecord, UUID> {

	public List<AccountRecord> findByTransFromOrTransTo(UUID transFrom, UUID transTo);
}
