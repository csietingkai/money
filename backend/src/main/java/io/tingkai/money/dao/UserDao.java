package io.tingkai.money.dao;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import io.tingkai.money.entity.User;
import io.tingkai.money.enumeration.Role;

@Repository
public interface UserDao extends JpaRepository<User, UUID> {

	public Optional<User> findByName(String name);

	public List<User> findByRole(Role role);
}
