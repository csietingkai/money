package io.tingkai.money.dao;

import java.util.UUID;

import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import io.tingkai.money.entity.Account;

/**
 * CrudRepository for sql database table 'account_record'
 * 
 * @author tingkai
 */
@Repository
public interface AccountRecordDao extends CrudRepository<Account, UUID> {
}
