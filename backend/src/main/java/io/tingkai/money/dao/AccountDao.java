package io.tingkai.money.dao;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import io.tingkai.money.entity.Account;

@Repository
public interface AccountDao extends JpaRepository<Account, UUID> {

	public List<Account> findByUserId(UUID userId);

	public Optional<Account> findByNameAndUserId(String name, UUID userId);
}
