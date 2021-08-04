package io.tingkai.money.dao;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import io.tingkai.money.entity.FundRecord;

@Repository
public interface FundRecordDao extends JpaRepository<FundRecord, UUID> {

	public List<FundRecord> findByCode(String code);

	public List<FundRecord> findByCodeOrderByDate(String code);

	public List<FundRecord> findByCodeAndDateBetweenOrderByDate(String code, LocalDateTime start, LocalDateTime end);

	public Optional<FundRecord> findByCodeAndDate(String code, LocalDateTime dealDate);

	public Optional<FundRecord> findFirstByCodeOrderByDateDesc(String code);

	@Query(value = "SELECT DISTINCT fr.code FROM fund_record fr", nativeQuery = true)
	public List<String> findDistinctCode();
}
