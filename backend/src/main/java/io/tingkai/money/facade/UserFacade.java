package io.tingkai.money.facade;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import io.tingkai.money.constant.DatabaseConstants;
import io.tingkai.money.dao.UserDao;
import io.tingkai.money.entity.User;
import io.tingkai.money.enumeration.Role;
import io.tingkai.money.model.exception.AlreadyExistException;
import io.tingkai.money.model.exception.FieldMissingException;
import io.tingkai.money.model.exception.NotExistException;
import io.tingkai.money.model.exception.QueryNotResultException;
import io.tingkai.money.util.AppUtil;

@Service
public class UserFacade {

	@Autowired
	private UserDao userDao;

	public List<User> queryAll() throws QueryNotResultException {
		List<User> entities = this.userDao.findAll();
		if (entities.size() == 0) {
			throw new QueryNotResultException(DatabaseConstants.TABLE_USER);
		}
		return entities;
	}

	public List<User> queryByRole(Role role) throws QueryNotResultException {
		List<User> entities = this.userDao.findByRole(role);
		if (entities.size() == 0) {
			throw new QueryNotResultException(DatabaseConstants.TABLE_USER);
		}
		return entities;
	}

	public User query(UUID id) throws QueryNotResultException {
		Optional<User> optional = this.userDao.findById(id);
		if (optional.isEmpty()) {
			throw new QueryNotResultException(DatabaseConstants.TABLE_USER);
		}
		return optional.get();
	}

	public User queryByName(String name) throws QueryNotResultException {
		Optional<User> optional = this.userDao.findByName(name);
		if (optional.isEmpty()) {
			throw new QueryNotResultException(DatabaseConstants.TABLE_USER);
		}
		return optional.get();
	}

	public User queryByEmail(String email) throws QueryNotResultException {
		Optional<User> optional = this.userDao.findByEmail(email);
		if (optional.isEmpty()) {
			throw new QueryNotResultException(DatabaseConstants.TABLE_USER);
		}
		return optional.get();
	}

	public User insert(User entity) throws AlreadyExistException, FieldMissingException {
		if (!AppUtil.isAllPresent(entity, entity.getName(), entity.getEmail(), entity.getPwd())) {
			throw new FieldMissingException();
		}
		Optional<User> optional = this.userDao.findByName(entity.getName());
		if (optional.isEmpty()) {
			optional = this.userDao.findByEmail(entity.getEmail());
		}
		if (optional.isPresent()) {
			throw new AlreadyExistException();
		}
		return this.userDao.save(entity);
	}

	public User update(User entity) throws NotExistException, FieldMissingException {
		if (!AppUtil.isAllPresent(entity, entity.getId())) {
			throw new FieldMissingException();
		}
		Optional<User> optional = this.userDao.findById(entity.getId());
		if (optional.isEmpty()) {
			throw new NotExistException();
		}
		User updateEntity = optional.get();
		updateEntity.setName(entity.getName());
		updateEntity.setEmail(entity.getEmail());
		updateEntity.setPwd(entity.getPwd());
		updateEntity.setRole(entity.getRole());
		return this.userDao.save(updateEntity);
	}

	public void delete(UUID id) throws NotExistException {
		if (!AppUtil.isAllPresent(id)) {
			throw new NotExistException();
		}
		Optional<User> optional = this.userDao.findById(id);
		if (optional.isEmpty()) {
			throw new NotExistException();
		}
		this.userDao.delete(optional.get());
	}
}
