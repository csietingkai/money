package io.tingkai.auth.facade;

import java.text.MessageFormat;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import io.tingkai.auth.constant.AuthConstant;
import io.tingkai.auth.dao.UserDao;
import io.tingkai.auth.entity.User;
import io.tingkai.auth.enumeration.Role;
import io.tingkai.base.constant.BaseMessageConstant;
import io.tingkai.base.model.exception.AlreadyExistException;
import io.tingkai.base.model.exception.FieldMissingException;
import io.tingkai.base.model.exception.NotExistException;
import io.tingkai.base.util.BaseAppUtil;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class UserFacade {

	@Autowired
	private UserDao userDao;

	public List<User> queryAll() {
		List<User> entities = userDao.findAll();
		if (entities.size() == 0) {
			log.trace(MessageFormat.format(BaseMessageConstant.QUERY_NO_DATA, AuthConstant.TABLE_USER));
		}
		return entities;
	}

	public List<User> queryByRole(Role role) {
		List<User> entities = userDao.findByRole(role);
		if (entities.size() == 0) {
			log.trace(MessageFormat.format(BaseMessageConstant.QUERY_NO_DATA, AuthConstant.TABLE_USER));
		}
		return entities;
	}

	public User query(UUID id) {
		Optional<User> optional = userDao.findById(id);
		if (optional.isEmpty()) {
			log.trace(MessageFormat.format(BaseMessageConstant.QUERY_NO_DATA, AuthConstant.TABLE_USER));
		}
		return optional.get();
	}

	public User queryByName(String name) {
		Optional<User> optional = userDao.findByName(name);
		if (optional.isEmpty()) {
			log.trace(MessageFormat.format(BaseMessageConstant.QUERY_NO_DATA, AuthConstant.TABLE_USER));
		}
		return optional.get();
	}

	public User insert(User entity) throws AlreadyExistException, FieldMissingException {
		if (!BaseAppUtil.isAllPresent(entity, entity.getName(), entity.getPwd())) {
			throw new FieldMissingException();
		}
		if (!BaseAppUtil.isAllPresent(entity.getRole())) {
			entity.setRole(Role.USER);
		}
		Optional<User> optional = userDao.findByName(entity.getName());
		if (optional.isPresent()) {
			throw new AlreadyExistException();
		}
		return userDao.save(entity);
	}

	public User update(User entity) throws NotExistException, FieldMissingException {
		if (!BaseAppUtil.isAllPresent(entity, entity.getId(), entity.getName(), entity.getPwd(), entity.getRole())) {
			throw new FieldMissingException();
		}
		Optional<User> optional = userDao.findById(entity.getId());
		if (optional.isEmpty()) {
			throw new NotExistException();
		}
		User updateEntity = optional.get();
		updateEntity.setName(entity.getName());
		updateEntity.setPwd(entity.getPwd());
		updateEntity.setRole(entity.getRole());
		return userDao.save(updateEntity);
	}

	public void delete(UUID id) throws NotExistException {
		if (!BaseAppUtil.isAllPresent(id)) {
			throw new NotExistException();
		}
		Optional<User> optional = userDao.findById(id);
		if (optional.isEmpty()) {
			throw new NotExistException();
		}
		userDao.delete(optional.get());
	}
}
