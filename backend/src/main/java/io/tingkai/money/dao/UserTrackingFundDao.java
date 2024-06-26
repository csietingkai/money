package io.tingkai.money.dao;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import io.tingkai.money.entity.UserTrackingFund;

@Repository
public interface UserTrackingFundDao extends JpaRepository<UserTrackingFund, UUID> {

	public List<UserTrackingFund> findByUserIdOrderByFundCode(UUID userId);

	public Optional<UserTrackingFund> findByUserIdAndFundCode(UUID userId, String fundCode);
}
