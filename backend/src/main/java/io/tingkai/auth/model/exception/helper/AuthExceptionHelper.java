package io.tingkai.auth.model.exception.helper;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

import io.tingkai.auth.model.exception.AuthTokenExpireException;
import io.tingkai.auth.model.exception.IllegalRoleException;
import io.tingkai.auth.model.exception.UserNotFoundException;
import io.tingkai.auth.model.exception.WrongPasswordException;
import io.tingkai.base.model.response.BaseResponse;
import io.tingkai.base.model.response.SimpleResponse;
import lombok.extern.slf4j.Slf4j;

@ControllerAdvice
@Slf4j
public class AuthExceptionHelper {

	@ExceptionHandler(AuthTokenExpireException.class)
	public ResponseEntity<BaseResponse<?>> handleAuthTokenExpireException(Exception e) {
		log.debug(e.getMessage(), e);
		return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new SimpleResponse(e));
	}

	@ExceptionHandler(IllegalRoleException.class)
	public ResponseEntity<BaseResponse<?>> handleIllegalRoleException(Exception e) {
		log.debug(e.getMessage(), e);
		return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new SimpleResponse(e));
	}

	@ExceptionHandler(UserNotFoundException.class)
	public ResponseEntity<BaseResponse<?>> handleUserNotFoundException(Exception e) {
		log.debug(e.getMessage(), e);
		return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new SimpleResponse(e));
	}

	@ExceptionHandler(WrongPasswordException.class)
	public ResponseEntity<BaseResponse<?>> handleWrongPasswordException(Exception e) {
		log.debug(e.getMessage(), e);
		return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new SimpleResponse(e));
	}
}
