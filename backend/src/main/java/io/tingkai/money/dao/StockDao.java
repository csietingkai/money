package io.tingkai.money.dao;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import io.tingkai.money.entity.Stock;
import io.tingkai.money.enumeration.MarketType;

@Repository
public interface StockDao extends JpaRepository<Stock, UUID> {

	public Iterable<Stock> findAllByOrderByCode();

	public Optional<Stock> findByCode(String code);

	public long countByMarketType(MarketType marketType);

	public Iterable<Stock> findByCodeNotIn(List<String> codes);
}
