package io.tingkai.money.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import io.tingkai.money.constant.CodeConstants;
import io.tingkai.money.entity.ExchangeRate;
import io.tingkai.money.entity.ExchangeRateRecord;
import io.tingkai.money.facade.ExchangeRateFacade;
import io.tingkai.money.facade.ExchangeRateRecordFacade;
import io.tingkai.money.logging.Loggable;
import io.tingkai.money.model.exception.NotExistException;
import io.tingkai.money.model.exception.QueryNotResultException;
import io.tingkai.money.util.AppUtil;

@Service
@Loggable
public class ExchangeRateService {

	@Autowired
	private ExchangeRateFacade exchangeRateFacade;

	@Autowired
	private ExchangeRateRecordFacade exchangeRateRecordFacade;

	@Autowired
	@Qualifier(CodeConstants.PYTHON_CACHE)
	private RedisTemplate<String, List<ExchangeRate>> cache;

	public List<ExchangeRate> getAll() throws QueryNotResultException {
		List<ExchangeRate> entities = cache.opsForValue().get(CodeConstants.EXCHANGE_RATE_LIST_KEY);
		if (AppUtil.isEmpty(entities)) {
			entities = this.exchangeRateFacade.queryAll();
			cache.opsForValue().set(CodeConstants.EXCHANGE_RATE_LIST_KEY, entities);
		}
		return entities;
	}

	public List<ExchangeRateRecord> getAllRecords(String code) throws QueryNotResultException {
		return this.exchangeRateRecordFacade.queryAll(code);
	}

	public List<ExchangeRateRecord> getAllRecords(String code, long start, long end) throws QueryNotResultException {
		return this.exchangeRateRecordFacade.queryAll(code, start, end);
	}

	public void delete(String id) throws NotExistException {
		this.exchangeRateFacade.delete(id);
	}
}
