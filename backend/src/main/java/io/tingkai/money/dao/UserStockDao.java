package io.tingkai.money.dao;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import io.tingkai.money.entity.UserStock;

/**
 * CrudRepository for sql database table 'user_stock'
 * 
 * @author tingkai
 */
@Repository
public interface UserStockDao extends JpaRepository<UserStock, UUID> {

	public Iterable<UserStock> findByUserName(String username);

	public Optional<UserStock> findByUserNameAndStockCode(String username, String stockCode);
}
