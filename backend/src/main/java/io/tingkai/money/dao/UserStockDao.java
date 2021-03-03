package io.tingkai.money.dao;

import java.util.UUID;

import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import io.tingkai.money.entity.UserStock;

/**
 * CrudRepository for sql database table 'user_stock'
 * 
 * @author tingkai
 */
@Repository
public interface UserStockDao extends CrudRepository<UserStock, UUID> {
}
