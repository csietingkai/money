package io.tingkai.money.model.vo;

import io.tingkai.money.entity.UserSetting;
import io.tingkai.money.security.AuthToken;
import lombok.Data;

@Data
public class LoginRespVo {

	protected AuthToken authToken;
	protected UserSetting setting;

	public static LoginRespVo of(AuthToken authToken, UserSetting setting) {
		LoginRespVo vo = new LoginRespVo();
		vo.setAuthToken(authToken);
		vo.setSetting(setting);
		return vo;
	}
}
