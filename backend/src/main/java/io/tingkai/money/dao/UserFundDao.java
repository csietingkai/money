package io.tingkai.money.dao;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import io.tingkai.money.entity.UserFund;

@Repository
public interface UserFundDao extends JpaRepository<UserFund, UUID> {

	public List<UserFund> findByUserName(String username);

	public Optional<UserFund> findByUserNameAndFundCode(String username, String fundCode);
}
