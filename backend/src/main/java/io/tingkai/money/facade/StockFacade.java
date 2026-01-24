package io.tingkai.money.facade;

import java.math.BigDecimal;
import java.text.MessageFormat;
import java.util.List;
import java.util.Optional;
import java.util.Set;
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
import io.tingkai.money.dao.StockDao;
import io.tingkai.money.dao.UserStockDao;
import io.tingkai.money.dao.UserTrackingStockDao;
import io.tingkai.money.entity.Stock;
import io.tingkai.money.enumeration.MarketType;
import io.tingkai.money.service.DataFetcherService;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class StockFacade {

	@Autowired
	private StockDao stockDao;

	@Autowired
	private UserStockDao userStockDao;

	@Autowired
	private UserTrackingStockDao userTrackingStockDao;

	@Autowired
	private DataFetcherService pythonFetcherService;

	public List<Stock> queryAll() {
		return this.queryAll(true);
	}

	public List<Stock> queryAll(boolean sort) {
		List<Stock> entities = this.stockDao.findAll();
		if (sort) {
			this.sort(entities);
		}
		if (entities.size() == 0) {
			log.trace(MessageFormat.format(MessageConstant.QUERY_NO_DATA, DatabaseConstant.TABLE_STOCK));
		}
		return entities;
	}

	public List<Stock> queryByUserStockExist() {
		return this.queryByUserStockExist(true);
	}

	public List<Stock> queryByUserStockExist(boolean sort) {
		Set<String> userStockCodes = this.userStockDao.findAll().stream().filter(us -> BigDecimal.ZERO.compareTo(us.getAmount()) != 0).map(us -> us.getStockCode()).collect(Collectors.toSet());
		List<Stock> entities = this.stockDao.findAll().stream().filter(s -> userStockCodes.contains(s.getCode())).collect(Collectors.toList());
		if (sort) {
			this.sort(entities);
		}
		if (entities.size() == 0) {
			log.trace(MessageFormat.format(MessageConstant.QUERY_NO_DATA, DatabaseConstant.TABLE_STOCK));
		}
		return entities;
	}

	public List<Stock> queryByUserTrackingStockExist() {
		return this.queryByUserTrackingStockExist(true);
	}

	public List<Stock> queryByUserTrackingStockExist(boolean sort) {
		Set<String> userTrackingStockCodes = this.userTrackingStockDao.findAll().stream().map(us -> us.getStockCode()).collect(Collectors.toSet());
		List<Stock> entities = this.stockDao.findAll().stream().filter(s -> userTrackingStockCodes.contains(s.getCode())).collect(Collectors.toList());
		if (sort) {
			this.sort(entities);
		}
		if (entities.size() == 0) {
			log.trace(MessageFormat.format(MessageConstant.QUERY_NO_DATA, DatabaseConstant.TABLE_STOCK));
		}
		return entities;
	}

	public Stock query(String code) {
		Optional<Stock> optional = this.stockDao.findByCode(code);
		if (optional.isEmpty()) {
			this.pythonFetcherService.fetchStock(code);
		}
		optional = this.stockDao.findByCode(code);
		if (optional.isEmpty()) {
			log.trace(MessageFormat.format(MessageConstant.QUERY_NO_DATA, DatabaseConstant.TABLE_STOCK));
		}
		return optional.get();
	}

	public Stock insert(Stock entity) throws AlreadyExistException, FieldMissingException {
		if (!BaseAppUtil.isAllPresent(entity, entity.getCode(), entity.getName(), entity.getIsinCode(), entity.getOfferingDate(), entity.getCfiCode())) {
			throw new FieldMissingException();
		}
		Optional<Stock> optional = this.stockDao.findByCode(entity.getCode());
		if (optional.isPresent()) {
			throw new AlreadyExistException();
		}
		return this.stockDao.save(entity);
	}

	public List<Stock> insertAll(List<Stock> entities) throws AlreadyExistException, FieldMissingException {
		long hasFieldMissingCount = entities.stream().filter(entity -> !BaseAppUtil.isAllPresent(entity, entity.getCode(), entity.getName(), entity.getIsinCode(), entity.getOfferingDate(), entity.getCfiCode())).count();
		if (hasFieldMissingCount > 0L) {
			throw new FieldMissingException();
		}
		return this.stockDao.saveAll(entities);
	}

	public Stock update(Stock entity) throws NotExistException, FieldMissingException {
		if (!BaseAppUtil.isAllPresent(entity, entity.getId())) {
			throw new FieldMissingException();
		}
		Optional<Stock> optional = this.stockDao.findById(entity.getId());
		if (optional.isEmpty()) {
			throw new NotExistException();
		}
		Stock updateEntity = optional.get();
		updateEntity.setCode(entity.getCode());
		updateEntity.setName(entity.getName());
		updateEntity.setIsinCode(entity.getIsinCode());
		updateEntity.setOfferingDate(entity.getOfferingDate());
		updateEntity.setMarketType(entity.getMarketType());
		updateEntity.setIndustryType(entity.getIndustryType());
		updateEntity.setCfiCode(entity.getCfiCode());
		updateEntity.setDescription(entity.getDescription());
		return this.stockDao.save(updateEntity);
	}

	public void delete(UUID id) throws NotExistException {
		if (BaseAppUtil.isEmpty(id) || StringUtil.isNullOrEmpty(id.toString())) {
			throw new NotExistException();
		}
		Optional<Stock> optional = this.stockDao.findById(id);
		if (optional.isEmpty()) {
			throw new NotExistException();
		}
		this.stockDao.deleteById(id);
	}

	public long count() {
		return this.stockDao.count();
	}

	public long countByMarketType(MarketType marketType) {
		return this.stockDao.countByMarketType(marketType);
	}

	private void sort(List<Stock> list) {
		list.sort((a, b) -> {
			if (a.getCode().length() != b.getCode().length()) {
				return a.getCode().length() - b.getCode().length();
			}
			return a.getCode().compareTo(b.getCode());
		});
	}
}
