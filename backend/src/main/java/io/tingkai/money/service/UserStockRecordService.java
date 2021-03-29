package io.tingkai.money.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import io.tingkai.money.constant.CodeConstants;
import io.tingkai.money.constant.DatabaseConstants;
import io.tingkai.money.dao.UserStockRecordDao;
import io.tingkai.money.entity.UserStock;
import io.tingkai.money.entity.UserStockRecord;
import io.tingkai.money.enumeration.DealType;
import io.tingkai.money.model.exception.QueryNotResultException;

/**
 * provide method for delete user stored in sql database table
 * 'user_stock_record'
 * 
 * @author tingkai
 */
@Service
public class UserStockRecordService {

	@Autowired
	private UserStockService userStockService;

	@Autowired
	private UserStockRecordDao userStockRecordDao;

	public List<UserStockRecord> getAll(String username) throws QueryNotResultException {
		List<UserStock> stocks = this.userStockService.getAll(username);
		List<UserStockRecord> entities = new ArrayList<UserStockRecord>();
		Iterable<UserStockRecord> iterable = this.userStockRecordDao.findByUserStockIdIn(stocks.stream().map(x -> x.getId()).collect(Collectors.toList()));
		iterable.forEach(entities::add);
		if (entities.size() == 0) {
			throw new QueryNotResultException(DatabaseConstants.TABLE_USER_STOCK_RECORD);
		}
		return entities;
	}

	public UserStockRecord buy(UUID userStockId, LocalDateTime date, BigDecimal share, BigDecimal price) {
		UserStockRecord entity = new UserStockRecord();
		entity.setUserStockId(userStockId);
		entity.setType(DealType.BUY);
		entity.setDate(date);
		entity.setShare(share);
		entity.setPrice(price);
		entity.setFee(this.calcFee(price, share));
		entity.setTax(BigDecimal.ZERO);
		return this.userStockRecordDao.save(entity);
	}

	public BigDecimal calcFee(BigDecimal price, BigDecimal share) {
		BigDecimal fee = CodeConstants.FEE_RATE.multiply(price).multiply(share);
		if (CodeConstants.MIN_FEE.compareTo(fee) > 0) {
			fee = CodeConstants.MIN_FEE;
		}
		fee = fee.setScale(0, RoundingMode.CEILING);
		return fee;
	}

	public BigDecimal calcTax(BigDecimal price, BigDecimal share) {
		BigDecimal tax = CodeConstants.TAX_RATE.multiply(price).multiply(share);
		tax = tax.setScale(0, RoundingMode.CEILING);
		return tax;
	}
}
