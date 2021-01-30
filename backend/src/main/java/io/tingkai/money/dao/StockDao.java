package io.tingkai.money.dao;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import io.tingkai.money.entity.Stock;
import io.tingkai.money.enumeration.MarketType;

/**
 * CrudRepository for sql database table 'stock'
 * 
 * @author tingkai
 */
@Repository
public interface StockDao extends CrudRepository<Stock, UUID> {

	public Optional<Stock> findByCode(String code);

	public long countByMarketType(MarketType marketType);
}
