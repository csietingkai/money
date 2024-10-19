package io.tingkai.money.facade;

import java.text.MessageFormat;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import io.tingkai.money.constant.DatabaseConstants;
import io.tingkai.money.constant.MessageConstant;
import io.tingkai.money.dao.BankInfoDao;
import io.tingkai.money.entity.BankInfo;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class BankInfoFacade {

	@Autowired
	private BankInfoDao BankInfoDao;

	public List<BankInfo> queryAll() {
		List<BankInfo> entities = this.BankInfoDao.findAll();
		if (entities.size() == 0) {
			log.trace(MessageFormat.format(MessageConstant.QUERY_NO_DATA, DatabaseConstants.TABLE_BANK_INFO));
		}
		return entities;
	}

	public BankInfo query(String id) {
		Optional<BankInfo> optional = this.BankInfoDao.findById(id);
		if (optional.isEmpty()) {
			log.trace(MessageFormat.format(MessageConstant.QUERY_NO_DATA, DatabaseConstants.TABLE_BANK_INFO));
		}
		return optional.get();
	}
}
