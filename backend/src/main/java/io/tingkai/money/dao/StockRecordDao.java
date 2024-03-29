package io.tingkai.money.dao;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import io.tingkai.money.entity.StockRecord;

@Repository
public interface StockRecordDao extends JpaRepository<StockRecord, UUID> {

	public List<StockRecord> findByCode(String code);

	public List<StockRecord> findByCodeOrderByDealDate(String code);

	public List<StockRecord> findByCodeAndDealDateBetweenOrderByDealDate(String code, LocalDateTime start, LocalDateTime end);

	public List<StockRecord> findByCodeAndDealDateBeforeOrderByDealDateDesc(String code, LocalDateTime date, Pageable pageable);

	public Optional<StockRecord> findByCodeAndDealDate(String code, LocalDateTime dealDate);

	public Optional<StockRecord> findFirstByCodeOrderByDealDateDesc(String code);

	@Query(value = "SELECT DISTINCT sr.code FROM stock_record sr", nativeQuery = true)
	public List<String> findDistinctCode();
}
