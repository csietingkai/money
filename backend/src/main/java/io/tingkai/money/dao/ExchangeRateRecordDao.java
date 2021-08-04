package io.tingkai.money.dao;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import io.tingkai.money.entity.ExchangeRateRecord;

@Repository
public interface ExchangeRateRecordDao extends JpaRepository<ExchangeRateRecord, UUID> {

	public Optional<ExchangeRateRecord> findByCurrencyAndDate(String currency, LocalDateTime date);

	public List<ExchangeRateRecord> findByCurrencyOrderByDate(String currency);

	public List<ExchangeRateRecord> findByCurrencyAndDateBetweenOrderByDate(String currency, LocalDateTime start, LocalDateTime end);

	public Optional<ExchangeRateRecord> findFirstByCurrencyOrderByDateDesc(String currency);

	public long countByCurrency(String currency);
}
