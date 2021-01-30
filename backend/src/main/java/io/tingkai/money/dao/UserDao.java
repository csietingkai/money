package io.tingkai.money.dao;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import io.tingkai.money.entity.User;
import io.tingkai.money.enumeration.Role;

/**
 * CrudRepository for sql database table 'users'
 * 
 * @author tingkai
 */
@Repository
public interface UserDao extends CrudRepository<User, UUID> {

	public Optional<User> findByName(String name);

	public Optional<User> findByEmail(String email);

	public Iterable<User> findByRole(Role role);
}
