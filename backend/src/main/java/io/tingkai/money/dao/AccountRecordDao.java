package io.tingkai.money.dao;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import io.tingkai.money.entity.AccountRecord;

/**
 * JpaRepository for sql database table 'account_record'
 * 
 * @author tingkai
 */
@Repository
public interface AccountRecordDao extends JpaRepository<AccountRecord, UUID> {

	public Iterable<AccountRecord> findByTransFromOrTransTo(UUID transFrom, UUID transTo);
}
