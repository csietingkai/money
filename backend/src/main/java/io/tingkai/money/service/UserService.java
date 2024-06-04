package io.tingkai.money.service;

import java.math.BigDecimal;
import java.text.MessageFormat;
import java.util.List;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import io.tingkai.money.constant.AppConstants;
import io.tingkai.money.constant.MessageConstant;
import io.tingkai.money.entity.User;
import io.tingkai.money.entity.UserSetting;
import io.tingkai.money.enumeration.Role;
import io.tingkai.money.enumeration.option.RecordType;
import io.tingkai.money.enumeration.option.StockType;
import io.tingkai.money.facade.UserFacade;
import io.tingkai.money.facade.UserSettingFacade;
import io.tingkai.money.logging.Loggable;
import io.tingkai.money.model.exception.AlreadyExistException;
import io.tingkai.money.model.exception.FieldMissingException;
import io.tingkai.money.model.exception.NotExistException;
import io.tingkai.money.model.exception.UserNotFoundException;
import io.tingkai.money.model.exception.WrongPasswordException;
import io.tingkai.money.util.AppUtil;
import lombok.extern.slf4j.Slf4j;

@Service
@Loggable
@Slf4j
public class UserService {

	@Autowired
	private UserFacade userFacade;

	@Autowired
	private UserSettingFacade userSettingFacade;

	@Autowired
	private PasswordEncoder bCryptPasswordEncoder;

	public User get(String name) {
		return this.userFacade.queryByName(name);
	}

	public User login(String name, String pwd) throws UserNotFoundException, WrongPasswordException {
		User user = this.userFacade.queryByName(name);
		if (AppUtil.isEmpty(user)) {
			throw new UserNotFoundException(name);
		}
		if (!this.bCryptPasswordEncoder.matches(pwd, user.getPwd())) {
			throw new WrongPasswordException();
		}
		return user;
	}

	public User create(User entity) throws AlreadyExistException, FieldMissingException {
		if (entity.getRole() != Role.USER) {
			log.warn(MessageFormat.format(MessageConstant.CREATE_USER_WARN, entity.getName(), "Role Error"));
			entity.setRole(Role.USER);
		}
		entity.setPwd(this.bCryptPasswordEncoder.encode(entity.getPwd()));
		entity = this.userFacade.insert(entity);

		UserSetting defaultSetting = new UserSetting();
		defaultSetting.setAccountRecordDeletable(false);
		defaultSetting.setAccountRecordType(RecordType.SALARY);
		defaultSetting.setPredictDays(BigDecimal.ONE);
		defaultSetting.setStockFeeRate(BigDecimal.ONE);
		defaultSetting.setFundFeeRate(BigDecimal.ONE);
		defaultSetting.setStockType(StockType.TW);
		defaultSetting.setUserId(entity.getId());
		this.userSettingFacade.insert(defaultSetting);
		return entity;
	}

	public User changePwd(UUID userId, String newPwd) throws NotExistException, FieldMissingException {
		User entity = this.userFacade.query(userId);
		entity.setPwd(this.bCryptPasswordEncoder.encode(newPwd));
		return this.userFacade.update(entity);
	}

	public boolean isRootExist() {
		List<User> entities = this.userFacade.queryByRole(Role.ROOT);
		return entities.size() > 0;
	}

	public User createRoot(String initRootPassword) throws AlreadyExistException, FieldMissingException {
		User root = new User();
		root.setName(AppConstants.INIT_ROOT_USERNAME);
		root.setPwd(this.bCryptPasswordEncoder.encode(initRootPassword));
		root.setRole(Role.ROOT);
		return this.userFacade.insert(root);
	}

	public UserSetting getUserSetting(UUID userId) {
		return this.userSettingFacade.queryByUserId(userId);
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
