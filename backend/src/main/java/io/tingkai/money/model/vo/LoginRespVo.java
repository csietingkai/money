package io.tingkai.money.model.vo;

import io.tingkai.auth.security.AuthToken;
import io.tingkai.money.entity.UserSetting;
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
