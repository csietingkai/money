package io.tingkai.money.service;

import java.util.AbstractMap;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import io.tingkai.money.enumeration.BetType;
import io.tingkai.money.enumeration.DealType;
import io.tingkai.money.enumeration.LotteryResult;
import io.tingkai.money.enumeration.MarketType;
import io.tingkai.money.enumeration.Role;
import io.tingkai.money.enumeration.SportType;

@Service
public class EnumService {

	public List<String> betTypeList() {
		// @formatter:off
		return Arrays.asList(BetType.values())
				.stream()
				.map(o -> o.toString())
				.sorted()
				.collect(Collectors.toList());
		// @formatter:on
	}

	public Map<String, String> betTypeMap() {
		// @formatter:off
		return Arrays.asList(BetType.values())
				.stream()
				.map(o -> o.toString())
				.collect(Collectors.toMap(str -> str, str -> str, (str1, str2) -> str1, TreeMap::new));
		// @formatter:on
	}

	public List<Map<String, String>> betTypeListMap() {
		// @formatter:off
		return Arrays.asList(BetType.values())
				.stream()
				.sorted()
				.map(o -> {
					return Map.ofEntries(
							new AbstractMap.SimpleEntry<String, String>("key", o.toString()),
							new AbstractMap.SimpleEntry<String, String>("value", o.toString())
					);
				})
				.collect(Collectors.toList());
		// @formatter:on
	}

	public List<String> dealTypeList() {
		// @formatter:off
		return Arrays.asList(DealType.values())
				.stream()
				.map(o -> o.toString())
				.sorted()
				.collect(Collectors.toList());
		// @formatter:on
	}

	public Map<String, String> dealTypeMap() {
		// @formatter:off
		return Arrays.asList(DealType.values())
				.stream()
				.map(o -> o.toString())
				.collect(Collectors.toMap(str -> str, str -> str, (str1, str2) -> str1, TreeMap::new));
		// @formatter:on
	}

	public List<Map<String, String>> dealTypeListMap() {
		// @formatter:off
		return Arrays.asList(DealType.values())
				.stream()
				.sorted()
				.map(o -> {
					return Map.ofEntries(
							new AbstractMap.SimpleEntry<String, String>("key", o.toString()),
							new AbstractMap.SimpleEntry<String, String>("value", o.toString())
					);
				})
				.collect(Collectors.toList());
		// @formatter:on
	}

	public List<String> lotteryResultList() {
		// @formatter:off
		return Arrays.asList(LotteryResult.values())
				.stream()
				.map(o -> o.toString())
				.sorted()
				.collect(Collectors.toList());
		// @formatter:on
	}

	public Map<String, String> lotteryResultMap() {
		// @formatter:off
		return Arrays.asList(LotteryResult.values())
				.stream()
				.map(o -> o.toString())
				.collect(Collectors.toMap(str -> str, str -> str, (str1, str2) -> str1, TreeMap::new));
		// @formatter:on
	}

	public List<Map<String, String>> lotteryResultListMap() {
		// @formatter:off
		return Arrays.asList(LotteryResult.values())
				.stream()
				.sorted()
				.map(o -> {
					return Map.ofEntries(
							new AbstractMap.SimpleEntry<String, String>("key", o.toString()),
							new AbstractMap.SimpleEntry<String, String>("value", o.toString())
					);
				})
				.collect(Collectors.toList());
		// @formatter:on
	}

	public List<String> marketTypeList() {
		// @formatter:off
		return Arrays.asList(MarketType.values())
				.stream()
				.map(o -> o.toString())
				.sorted()
				.collect(Collectors.toList());
		// @formatter:on
	}

	public Map<String, String> marketTypeMap() {
		// @formatter:off
		return Arrays.asList(MarketType.values())
				.stream()
				.map(o -> o.toString())
				.collect(Collectors.toMap(str -> str, str -> str, (str1, str2) -> str1, TreeMap::new));
		// @formatter:on
	}

	public List<Map<String, String>> marketTypeListMap() {
		// @formatter:off
		return Arrays.asList(MarketType.values())
				.stream()
				.sorted()
				.map(o -> {
					return Map.ofEntries(
							new AbstractMap.SimpleEntry<String, String>("key", o.toString()),
							new AbstractMap.SimpleEntry<String, String>("value", o.toString())
					);
				})
				.collect(Collectors.toList());
		// @formatter:on
	}

	public List<String> roleList() {
		// @formatter:off
		return Arrays.asList(Role.values())
				.stream()
				.map(o -> o.toString())
				.sorted()
				.collect(Collectors.toList());
		// @formatter:on
	}

	public Map<String, String> roleMap() {
		// @formatter:off
		return Arrays.asList(Role.values())
				.stream()
				.map(o -> o.toString())
				.collect(Collectors.toMap(str -> str, str -> str, (str1, str2) -> str1, TreeMap::new));
		// @formatter:on
	}

	public List<Map<String, String>> roleListMap() {
		// @formatter:off
		return Arrays.asList(Role.values())
				.stream()
				.sorted()
				.map(o -> {
					return Map.ofEntries(
							new AbstractMap.SimpleEntry<String, String>("key", o.toString()),
							new AbstractMap.SimpleEntry<String, String>("value", o.toString())
					);
				})
				.collect(Collectors.toList());
		// @formatter:on
	}

	public List<String> sportTypeList() {
		// @formatter:off
		return Arrays.asList(SportType.values())
				.stream()
				.map(o -> o.toString())
				.sorted()
				.collect(Collectors.toList());
		// @formatter:on
	}

	public Map<String, String> sportTypeMap() {
		// @formatter:off
		return Arrays.asList(SportType.values())
				.stream()
				.map(o -> o.toString())
				.collect(Collectors.toMap(str -> str, str -> str, (str1, str2) -> str1, TreeMap::new));
		// @formatter:on
	}

	public List<Map<String, String>> sportTypeListMap() {
		// @formatter:off
		return Arrays.asList(SportType.values())
				.stream()
				.sorted()
				.map(o -> {
					return Map.ofEntries(
							new AbstractMap.SimpleEntry<String, String>("key", o.toString()),
							new AbstractMap.SimpleEntry<String, String>("value", o.toString())
					);
				})
				.collect(Collectors.toList());
		// @formatter:on
	}
}
