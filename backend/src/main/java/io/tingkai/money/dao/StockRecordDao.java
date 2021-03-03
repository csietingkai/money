package io.tingkai.money.dao;

import java.time.LocalDateTime;
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

	public Iterable<StockRecord> findByCode(String code);

	public Iterable<StockRecord> findAllByCodeOrderByDealDate(String code);

	public Iterable<StockRecord> findAllByCodeAndDealDateAfterAndDealDateBeforeOrderByDealDate(String code, LocalDateTime start, LocalDateTime end);

	public Optional<StockRecord> findFirstByCodeOrderByDealDateDesc(String code);
}
