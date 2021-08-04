package io.tingkai.money.dao;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import io.tingkai.money.entity.UserStock;

@Repository
public interface UserStockDao extends JpaRepository<UserStock, UUID> {

	public List<UserStock> findByUserName(String username);

	public Optional<UserStock> findByUserNameAndStockCode(String username, String stockCode);
}
