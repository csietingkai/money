package io.tingkai.money.dao;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import io.tingkai.money.entity.Account;

/**
 * JpaRepository for sql database table 'account'
 * 
 * @author tingkai
 */
@Repository
public interface AccountDao extends JpaRepository<Account, UUID> {

	public Iterable<Account> findByOwnerName(String ownerName);

	public Optional<Account> findByNameAndOwnerName(String name, String ownerName);
}
