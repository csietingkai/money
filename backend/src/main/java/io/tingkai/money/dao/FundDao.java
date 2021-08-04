package io.tingkai.money.dao;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import io.tingkai.money.entity.Fund;

@Repository
public interface FundDao extends JpaRepository<Fund, UUID> {

	public List<Fund> findAllByOrderByCode();

	public Optional<Fund> findByCode(String code);

	public List<Fund> findByCodeNotIn(List<String> codes);
}
