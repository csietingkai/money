package io.tingkai.money.service;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import io.tingkai.money.constant.AppConstants;
import io.tingkai.money.dao.UserDao;
import io.tingkai.money.entity.User;
import io.tingkai.money.enumeration.Role;
import io.tingkai.money.model.exception.IllegalRoleException;
import io.tingkai.money.model.exception.UserNotFoundException;
import io.tingkai.money.model.exception.WrongPasswordException;
import io.tingkai.money.util.ContextUtil;

/**
 * provide method for upload, download, find, delete user stored in sql database
 * table 'users'
 * 
 * @author tingkai
 */
@Service
public class UserService {

	@Autowired
	private UserDao userDao;

	@Autowired
	private PasswordEncoder bCryptPasswordEncoder;

	public User get(String name) {
		return this.userDao.findByName(name).get();
	}

	public User login(String name, String pwd) throws UserNotFoundException, WrongPasswordException {
		Optional<User> userOptional = this.userDao.findByName(name);
		if (userOptional.isPresent()) {
			User user = userOptional.get();
			if (this.bCryptPasswordEncoder.matches(pwd, user.getPwd())) {
				return user;
			}
			throw new WrongPasswordException();
		} else {
			throw new UserNotFoundException(name);
		}
	}

	public void create(User user) throws IllegalRoleException {
		if (user.getRole() != Role.USER) {
			throw new IllegalRoleException(user.getRole().name());
		}
		user.setPwd(this.bCryptPasswordEncoder.encode(user.getPwd()));
		user.setRole(Role.USER);
		this.userDao.save(user);
	}

	public void confirm(String email) {
		Optional<User> optionalUser = this.userDao.findByEmail(email);
		if (optionalUser.isPresent()) {
			User user = optionalUser.get();
			user.setConfirm(true);
			this.userDao.save(user);
		}
	}

	public void setUserAsAdmin(User userToBeAdmin) {
		if (isCurrentUserRoot()) {
			userToBeAdmin.setRole(Role.ADMIN);
			this.userDao.save(userToBeAdmin);
		}
	}

	public boolean isCurrentUserRoot() {
		Optional<User> loginUser = getCurrentLoginUser();
		return loginUser.isPresent() && loginUser.get().getRole() == Role.ROOT;
	}

	public boolean isCurrentUserConfirm() {
		Optional<User> loginUser = getCurrentLoginUser();
		return loginUser.isPresent() && loginUser.get().getRole() == Role.ROOT;
	}

	public boolean isRootExist() {
		Iterable<User> users = this.userDao.findByRole(Role.ROOT);
		for (User user : users) {
			if (Role.ROOT == user.getRole()) {
				return true;
			}
		}
		return false;
	}

	public void createRoot(String initRootPassword) {
		User root = new User();
		root.setName(AppConstants.INIT_ROOT_USERNAME);
		root.setPwd(this.bCryptPasswordEncoder.encode(initRootPassword));
		root.setEmail(AppConstants.INIT_ROOT_EMAIL);
		root.setRole(Role.ROOT);
		this.userDao.save(root);
	}

	private Optional<User> getCurrentLoginUser() {
		String loginUsername = ContextUtil.getUserName();
		return this.userDao.findByName(loginUsername);
	}
}
