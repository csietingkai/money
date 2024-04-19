package io.tingkai.money.model.vo;

import lombok.Data;

@Data
public class OptionVo {
	protected String key;
	protected String value;

	public static OptionVo of(String key, String value) {
		OptionVo vo = new OptionVo();
		vo.setKey(key);
		vo.setValue(value);
		return vo;
	}
}
