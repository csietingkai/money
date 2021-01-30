package io.tingkai.money.dao;

import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import io.tingkai.money.entity.ExchangeRate;

/**
 * CrudRepository for sql database table 'exchange_rate'
 * 
 * @author tingkai
 */
@Repository
public interface ExchangeRateDao extends CrudRepository<ExchangeRate, String> {
}
