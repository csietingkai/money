package io.tingkai.money.dao;

import java.util.UUID;

import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import io.tingkai.money.entity.UserStockRecord;

/**
 * CrudRepository for sql database table 'user_stock_record'
 * 
 * @author tingkai
 */
@Repository
public interface UserStockRecordDao extends CrudRepository<UserStockRecord, UUID> {
}
