package io.tingkai.money.dao;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import io.tingkai.money.entity.ExchangeRateRecord;

/**
 * CrudRepository for sql database table 'exchange_rate'
 * 
 * @author tingkai
 */
@Repository
public interface ExchangeRateRecordDao extends CrudRepository<ExchangeRateRecord, UUID> {

	public Optional<ExchangeRateRecord> findByCurrencyAndDate(String currency, LocalDateTime date);

	public Iterable<ExchangeRateRecord> findByCurrency(String currency);

	public Iterable<ExchangeRateRecord> findByDate(LocalDateTime date);

	public Optional<ExchangeRateRecord> findFirstByCurrencyOrderByDateDesc(String currency);

	public long countByCurrency(String currency);
}
