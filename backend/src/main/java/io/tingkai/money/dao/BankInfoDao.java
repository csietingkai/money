package io.tingkai.money.dao;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import io.tingkai.money.entity.BankInfo;

@Repository
public interface BankInfoDao extends JpaRepository<BankInfo, String> {
}
