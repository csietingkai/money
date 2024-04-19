package io.tingkai.money.model.exception.helper;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

import io.tingkai.money.constant.AppConstants;
import io.tingkai.money.model.exception.AlreadyExistException;
import io.tingkai.money.model.exception.FieldMissingException;
import io.tingkai.money.model.exception.NotExistException;
import io.tingkai.money.model.response.BaseResponse;
import io.tingkai.money.model.response.SimpleResponse;
import lombok.extern.slf4j.Slf4j;

@ControllerAdvice
@Slf4j
public class ExceptionHelper {

	@ExceptionHandler(AlreadyExistException.class)
	public ResponseEntity<BaseResponse<?>> handleAlreadyExistException(Exception e) {
		if (AppConstants.DEBUG_MODE) {
			log.debug(e.getMessage(), e);
		}
		return ResponseEntity.status(HttpStatus.OK).body(new SimpleResponse(e));
	}

	@ExceptionHandler(NotExistException.class)
	public ResponseEntity<BaseResponse<?>> handleNotExistException(Exception e) {
		if (AppConstants.DEBUG_MODE) {
			log.debug(e.getMessage(), e);
		}
		return ResponseEntity.status(HttpStatus.OK).body(new SimpleResponse(e));
	}

	@ExceptionHandler(FieldMissingException.class)
	public ResponseEntity<BaseResponse<?>> handleFieldMissingException(Exception e) {
		if (AppConstants.DEBUG_MODE) {
			log.debug(e.getMessage(), e);
		}
		return ResponseEntity.status(HttpStatus.OK).body(new SimpleResponse(e));
	}

	@ExceptionHandler(Exception.class)
	public ResponseEntity<BaseResponse<?>> handleException(Exception e) {
		if (AppConstants.DEBUG_MODE) {
			log.debug(e.getMessage(), e);
		}
		return ResponseEntity.status(HttpStatus.OK).body(new SimpleResponse(e));
	}
}
