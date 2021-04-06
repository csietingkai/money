package io.tingkai.money.service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import io.netty.util.internal.StringUtil;
import io.tingkai.money.constant.CodeConstants;
import io.tingkai.money.constant.DatabaseConstants;
import io.tingkai.money.dao.ExchangeRateDao;
import io.tingkai.money.entity.ExchangeRate;
import io.tingkai.money.model.exception.AlreadyExistException;
import io.tingkai.money.model.exception.FieldMissingException;
import io.tingkai.money.model.exception.NotExistException;
import io.tingkai.money.model.exception.QueryNotResultException;
import io.tingkai.money.util.AppUtil;

@Service
public class ExchangeRateService {

	@Autowired
	private ExchangeRateDao exchangeRateDao;

	@Autowired
	@Qualifier(CodeConstants.PYTHON_CACHE)
	private RedisTemplate<String, List<ExchangeRate>> cache;

	public List<ExchangeRate> getAll() throws QueryNotResultException {
		List<ExchangeRate> entities = cache.opsForValue().get(CodeConstants.EXCHANGE_RATE_LIST_KEY);
		if (AppUtil.isEmpty(entities)) {
			entities = new ArrayList<ExchangeRate>();
			Iterable<ExchangeRate> iterable = this.exchangeRateDao.findAll();
			iterable.forEach(entities::add);
			if (entities.size() == 0) {
				throw new QueryNotResultException(DatabaseConstants.TABLE_EXCHANGE_RATE_RECORD);
			}
			cache.opsForValue().set(CodeConstants.EXCHANGE_RATE_LIST_KEY, entities);
		}
		return entities;
	}

	public ExchangeRate insert(ExchangeRate entity) throws AlreadyExistException, FieldMissingException {
		if (!AppUtil.isAllPresent(entity, entity.getCurrency(), entity.getName())) {
			throw new FieldMissingException();
		}
		Optional<ExchangeRate> optional = this.exchangeRateDao.findById(entity.getCurrency());
		if (optional.isPresent()) {
			throw new AlreadyExistException();
		}
		return this.exchangeRateDao.save(entity);
	}

	public List<ExchangeRate> insertAll(List<ExchangeRate> entities) throws AlreadyExistException, FieldMissingException {
		List<ExchangeRate> inserted = new ArrayList<ExchangeRate>();
		for (ExchangeRate entity : entities) {
			inserted.add(this.insert(entity));
		}
		return inserted;
	}

	public void delete(String id) throws NotExistException {
		if (StringUtil.isNullOrEmpty(id)) {
			throw new NotExistException();
		}
		Optional<ExchangeRate> optional = this.exchangeRateDao.findById(id);
		if (optional.isEmpty()) {
			throw new NotExistException();
		}
		this.exchangeRateDao.delete(optional.get());
	}

	public long count() {
		return this.exchangeRateDao.count();
	}
}
