package io.tingkai.money.enumeration;

import io.tingkai.money.util.AppUtil;

public enum StockRecordsSource {

	YAHOO("YAHOO"), TWSE("TWSE"), TPEX("TPEX");

	String value;

	private StockRecordsSource(String value) {
		this.value = value;
	}

	public String getValue() {
		return value;
	}

	public static StockRecordsSource convertByString(String value) {
		if (AppUtil.isPresent(value)) {
			for (StockRecordsSource type : StockRecordsSource.values()) {
				if (value.equals(type.getValue())) {
					return type;
				}
			}
		}
		return StockRecordsSource.YAHOO;
	}
}
