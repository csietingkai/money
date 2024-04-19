package io.tingkai.money.dao;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import io.tingkai.money.entity.FinancialFile;

@Repository
public interface FinancialFileDao extends JpaRepository<FinancialFile, UUID> {

	public List<FinancialFile> findByUserIdOrderByDateDesc(UUID userId);

	public List<FinancialFile> findByUserIdAndDateOrderByDateDesc(UUID userId, LocalDateTime date);

	public List<FinancialFile> findByUserIdAndTypeOrderByDateDesc(UUID userId, String type);

	public List<FinancialFile> findByUserIdAndDateAndTypeOrderByDateDesc(UUID userId, LocalDateTime date, String type);
}
