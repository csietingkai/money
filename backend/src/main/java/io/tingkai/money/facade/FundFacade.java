package io.tingkai.money.facade;

import java.math.BigDecimal;
import java.text.MessageFormat;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import io.netty.util.internal.StringUtil;
import io.tingkai.base.model.exception.AlreadyExistException;
import io.tingkai.base.model.exception.FieldMissingException;
import io.tingkai.base.model.exception.NotExistException;
import io.tingkai.base.util.BaseAppUtil;
import io.tingkai.money.constant.DatabaseConstant;
import io.tingkai.money.constant.MessageConstant;
import io.tingkai.money.dao.FundDao;
import io.tingkai.money.dao.UserFundDao;
import io.tingkai.money.entity.Fund;
import io.tingkai.money.service.DataFetcherService;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class FundFacade {

	@Autowired
	private FundDao fundDao;

	@Autowired
	private UserFundDao userFundDao;

	@Autowired
	private DataFetcherService pythonFetcherService;

	public List<Fund> queryAll() {
		return this.queryAll(true);
	}

	public List<Fund> queryAll(boolean sort) {
		List<Fund> entities = this.fundDao.findAll();
		if (sort) {
			this.sort(entities);
		}
		if (entities.size() == 0) {
			log.trace(MessageFormat.format(MessageConstant.QUERY_NO_DATA, DatabaseConstant.TABLE_FUND));
		}
		return entities;
	}

	public List<Fund> queryByUserFundExist() {
		return this.queryByUserFundExist(true);
	}

	public List<Fund> queryByUserFundExist(boolean sort) {
		List<String> userFundCodes = this.userFundDao.findAll().stream().filter(uf -> BigDecimal.ZERO.compareTo(uf.getAmount()) != 0).map(uf -> uf.getFundCode()).distinct().collect(Collectors.toList());
		List<Fund> entities = this.fundDao.findAll().stream().filter(f -> userFundCodes.indexOf(f.getCode()) >= 0).collect(Collectors.toList());
		if (sort) {
			this.sort(entities);
		}
		if (entities.size() == 0) {
			log.trace(MessageFormat.format(MessageConstant.QUERY_NO_DATA, DatabaseConstant.TABLE_FUND));
		}
		return entities;
	}

	public Fund query(String code) {
		Optional<Fund> optional = this.fundDao.findByCode(code);
		if (optional.isEmpty()) {
			this.pythonFetcherService.fetchFund(code);
		}
		optional = this.fundDao.findByCode(code);
		if (optional.isEmpty()) {
			log.trace(MessageFormat.format(MessageConstant.QUERY_NO_DATA, DatabaseConstant.TABLE_FUND));
		}
		return optional.get();
	}

	public Fund insert(Fund entity) throws AlreadyExistException, FieldMissingException {
		if (!BaseAppUtil.isAllPresent(entity, entity.getCode(), entity.getName(), entity.getIsinCode(), entity.getOfferingDate())) {
			throw new FieldMissingException();
		}
		Optional<Fund> optional = this.fundDao.findByCode(entity.getCode());
		if (optional.isPresent()) {
			throw new AlreadyExistException();
		}
		return this.fundDao.save(entity);
	}

	public List<Fund> insertAll(List<Fund> entities) throws AlreadyExistException, FieldMissingException {
		long hasFieldMissingCount = entities.stream().filter(entity -> !BaseAppUtil.isAllPresent(entity, entity.getCode(), entity.getName(), entity.getIsinCode(), entity.getOfferingDate())).count();
		if (hasFieldMissingCount > 0L) {
			throw new FieldMissingException();
		}
		return this.fundDao.saveAll(entities);
	}

	public Fund update(Fund entity) throws NotExistException, FieldMissingException {
		if (!BaseAppUtil.isAllPresent(entity, entity.getId())) {
			throw new FieldMissingException();
		}
		Optional<Fund> optional = this.fundDao.findById(entity.getId());
		if (optional.isEmpty()) {
			throw new NotExistException();
		}
		Fund updateEntity = optional.get();
		updateEntity.setCode(entity.getCode());
		updateEntity.setName(entity.getName());
		updateEntity.setIsinCode(entity.getIsinCode());
		updateEntity.setOfferingDate(entity.getOfferingDate());
		updateEntity.setDescription(entity.getDescription());
		return this.fundDao.save(updateEntity);
	}

	public void delete(UUID id) throws NotExistException {
		if (BaseAppUtil.isEmpty(id) || StringUtil.isNullOrEmpty(id.toString())) {
			throw new NotExistException();
		}
		Optional<Fund> optional = this.fundDao.findById(id);
		if (optional.isEmpty()) {
			throw new NotExistException();
		}
		this.fundDao.deleteById(id);
	}

	public long count() {
		return this.fundDao.count();
	}

	private void sort(List<Fund> list) {
		list.sort((a, b) -> {
			if (a.getCode().length() != b.getCode().length()) {
				return a.getCode().length() - b.getCode().length();
			}
			return a.getCode().compareTo(b.getCode());
		});
	}
}
