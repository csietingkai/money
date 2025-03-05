package io.tingkai.money.service;

import java.math.BigDecimal;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import io.tingkai.auth.util.ContextUtil;
import io.tingkai.base.log.Loggable;
import io.tingkai.base.model.exception.FieldMissingException;
import io.tingkai.base.model.exception.NotExistException;
import io.tingkai.money.entity.UserSetting;
import io.tingkai.money.facade.UserSettingFacade;
import lombok.extern.slf4j.Slf4j;

@Service
@Loggable
@Slf4j
public class UserService {

	@Autowired
	private UserSettingFacade userSettingFacade;

	public UserSetting getUserSetting() {
		return this.userSettingFacade.queryByUserId(ContextUtil.getUserId());
	}

	public UserSetting updateUserSetting(UserSetting newSetting) throws FieldMissingException, NotExistException {
		if (BigDecimal.ZERO.compareTo(newSetting.getPredictDays()) >= 0) {
			throw new FieldMissingException();
		}
		if (BigDecimal.ZERO.compareTo(newSetting.getStockFeeRate()) >= 0 || BigDecimal.ONE.compareTo(newSetting.getStockFeeRate()) < 0) {
			throw new FieldMissingException();
		}
		if (BigDecimal.ZERO.compareTo(newSetting.getFundFeeRate()) > 0 || BigDecimal.ONE.compareTo(newSetting.getFundFeeRate()) < 0) {
			throw new FieldMissingException();
		}
		return this.userSettingFacade.update(newSetting);
	}
}
