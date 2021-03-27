package io.tingkai.money.dao;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import io.tingkai.money.entity.ExchangeRate;

/**
 * JpaRepository for sql database table 'exchange_rate'
 * 
 * @author tingkai
 */
@Repository
public interface ExchangeRateDao extends JpaRepository<ExchangeRate, String> {
}
