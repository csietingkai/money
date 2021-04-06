package io.tingkai.money.entity;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

import javax.persistence.Entity;
import javax.persistence.EnumType;
import javax.persistence.Enumerated;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.Table;

import io.tingkai.money.constant.DatabaseConstants;
import io.tingkai.money.enumeration.BetType;
import io.tingkai.money.enumeration.LotteryResult;
import io.tingkai.money.enumeration.SportType;
import lombok.Data;

@Entity
@Data
@Table(name = DatabaseConstants.TABLE_SPORT_LOTTERY_RECORD)
public class SportLotteryRecord {
	@Id
	@GeneratedValue(strategy = GenerationType.AUTO)
	private UUID id;
	private UUID accountId;
	@Enumerated(EnumType.STRING)
	private SportType sportType;
	private BigDecimal stake;
	private BigDecimal odds;
	private LocalDateTime date;
	@Enumerated(EnumType.STRING)
	private BetType betType;
	private BigDecimal pointSpread;
	@Enumerated(EnumType.STRING)
	private LotteryResult result;
}