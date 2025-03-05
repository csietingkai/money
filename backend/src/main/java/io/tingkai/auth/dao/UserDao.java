package io.tingkai.auth.dao;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import io.tingkai.auth.entity.User;
import io.tingkai.auth.enumeration.Role;

@Repository
public interface UserDao extends JpaRepository<User, UUID> {

	public Optional<User> findByName(String name);

	public List<User> findByRole(Role role);
}
