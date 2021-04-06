package io.tingkai.money.dao;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import io.tingkai.money.entity.UserTrackingStock;

@Repository
public interface UserTrackingStockDao extends JpaRepository<UserTrackingStock, UUID> {

	public Iterable<UserTrackingStock> findByUserNameOrderByStockCode(String userName);

	public Optional<UserTrackingStock> findByUserNameAndStockCode(String userName, String stockCode);
}
