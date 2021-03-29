package io.tingkai.money.model.exception.helper;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

import io.tingkai.money.constant.AppConstants;
import io.tingkai.money.model.exception.StockAmountInvalidException;
import io.tingkai.money.model.response.BaseResponse;
import io.tingkai.money.model.response.StockResponse;
import lombok.extern.slf4j.Slf4j;

@ControllerAdvice
@Slf4j
public class StockExceptionHelper {

	@ExceptionHandler(StockAmountInvalidException.class)
	public ResponseEntity<BaseResponse<?>> handleStockAmountInvalidException(Exception e) {
		if (AppConstants.DEBUG_MODE) {
			log.debug(e.getMessage(), e);
		}
		return ResponseEntity.status(HttpStatus.OK).body(new StockResponse<Void>(e));
	}
}
