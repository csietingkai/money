package io.tingkai.money.dao;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import io.tingkai.money.entity.Option;

@Repository
public interface OptionDao extends JpaRepository<Option, UUID> {

	public List<Option> findByCatergory(String catergory);

	public Optional<Option> findByCatergoryAndName(String catergory, String name);
}
