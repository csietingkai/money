package io.tingkai.money.dao;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import io.tingkai.money.entity.StockRecord;

/**
 * CrudRepository for sql database table 'stock_record'
 * 
 * @author tingkai
 */
@Repository
public interface StockRecordDao extends CrudRepository<StockRecord, UUID> {

	public Optional<StockRecord> findFirstByCodeOrderByDealDateDesc(String code);
}
