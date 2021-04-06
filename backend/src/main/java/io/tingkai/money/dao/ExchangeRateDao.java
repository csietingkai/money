package io.tingkai.money.dao;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import io.tingkai.money.entity.ExchangeRate;

@Repository
public interface ExchangeRateDao extends JpaRepository<ExchangeRate, String> {
}
