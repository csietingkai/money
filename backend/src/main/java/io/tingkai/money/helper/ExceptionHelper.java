package io.tingkai.money.helper;

import javax.servlet.http.HttpServletResponse;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

import io.tingkai.money.constant.AppConstants;
import io.tingkai.money.model.exception.AuthTokenExpireException;
import io.tingkai.money.model.exception.IllegalRoleException;
import io.tingkai.money.model.exception.UserNotFoundException;
import io.tingkai.money.model.exception.WrongPasswordException;
import io.tingkai.money.model.response.AuthResponse;
import io.tingkai.money.model.response.BaseResponse;
import io.tingkai.money.model.response.SimpleResponse;
import lombok.extern.slf4j.Slf4j;

@ControllerAdvice
@Slf4j
public class ExceptionHelper {

	@ExceptionHandler(AuthTokenExpireException.class)
	public ResponseEntity<BaseResponse<?>> handleAuthTokenExpireException(Exception e, HttpServletResponse resp) {
		if (AppConstants.DEBUG_MODE) {
			log.debug(e.getMessage(), e);
		}
		return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new AuthResponse(e));
	}

	@ExceptionHandler(IllegalRoleException.class)
	public ResponseEntity<BaseResponse<?>> handleIllegalRoleException(Exception e, HttpServletResponse resp) {
		if (AppConstants.DEBUG_MODE) {
			log.debug(e.getMessage(), e);
		}
		return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new AuthResponse(e));
	}

	@ExceptionHandler(UserNotFoundException.class)
	public ResponseEntity<BaseResponse<?>> handleUserNotFoundException(Exception e, HttpServletResponse resp) {
		if (AppConstants.DEBUG_MODE) {
			log.debug(e.getMessage(), e);
		}
		return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new AuthResponse(e));
	}

	@ExceptionHandler(WrongPasswordException.class)
	public ResponseEntity<BaseResponse<?>> handleWrongPasswordException(Exception e, HttpServletResponse resp) {
		if (AppConstants.DEBUG_MODE) {
			log.debug(e.getMessage(), e);
		}
		return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new AuthResponse(e));
	}

	@ExceptionHandler(Exception.class)
	public ResponseEntity<BaseResponse<?>> handleException(Exception e, HttpServletResponse resp) {
		if (AppConstants.DEBUG_MODE) {
			log.debug(e.getMessage(), e);
		}
		return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new SimpleResponse(e));
	}
}
