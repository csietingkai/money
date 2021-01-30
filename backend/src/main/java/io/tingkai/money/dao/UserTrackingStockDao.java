package io.tingkai.money.dao;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import io.tingkai.money.entity.UserTrackingStock;

/**
 * CrudRepository for sql database table 'user_tracking_stock'
 * 
 * @author tingkai
 */
@Repository
public interface UserTrackingStockDao extends CrudRepository<UserTrackingStock, UUID> {

	public Iterable<UserTrackingStock> findByUserNameOrderByStockCode(String userName);

	public Optional<UserTrackingStock> findByUserNameAndStockCode(String userName, String stockCode);
}
