package io.tingkai.money.facade;

import java.text.MessageFormat;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import io.tingkai.base.model.exception.AlreadyExistException;
import io.tingkai.base.model.exception.FieldMissingException;
import io.tingkai.base.model.exception.NotExistException;
import io.tingkai.base.util.BaseAppUtil;
import io.tingkai.money.constant.DatabaseConstant;
import io.tingkai.money.constant.MessageConstant;
import io.tingkai.money.dao.FinancialFileDao;
import io.tingkai.money.entity.FinancialFile;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class FinacialFileFacade {

	@Autowired
	private FinancialFileDao financialFileDao;

	public List<FinancialFile> queryAll(UUID userId) {
		List<FinancialFile> entities = this.financialFileDao.findByUserIdOrderByDateDesc(userId);
		if (entities.size() == 0) {
			log.trace(MessageFormat.format(MessageConstant.QUERY_NO_DATA, DatabaseConstant.TABLE_FINANCIAL_FILE));
		}
		return entities;
	}

	public List<FinancialFile> queryAll(UUID userId, LocalDateTime date) {
		List<FinancialFile> entities = this.financialFileDao.findByUserIdAndDateOrderByDateDesc(userId, date);
		if (entities.size() == 0) {
			log.trace(MessageFormat.format(MessageConstant.QUERY_NO_DATA, DatabaseConstant.TABLE_FINANCIAL_FILE));
		}
		return entities;
	}

	public List<FinancialFile> queryAll(UUID userId, String type) {
		List<FinancialFile> entities = this.financialFileDao.findByUserIdAndTypeOrderByDateDesc(userId, type);
		if (entities.size() == 0) {
			log.trace(MessageFormat.format(MessageConstant.QUERY_NO_DATA, DatabaseConstant.TABLE_FINANCIAL_FILE));
		}
		return entities;
	}

	public List<FinancialFile> queryAll(UUID userId, LocalDateTime date, String type) {
		List<FinancialFile> entities = this.financialFileDao.findByUserIdAndDateAndTypeOrderByDateDesc(userId, date, type);
		if (entities.size() == 0) {
			log.trace(MessageFormat.format(MessageConstant.QUERY_NO_DATA, DatabaseConstant.TABLE_FINANCIAL_FILE));
		}
		return entities;
	}

	public FinancialFile query(UUID id) {
		Optional<FinancialFile> optional = this.financialFileDao.findById(id);
		if (optional.isEmpty()) {
			log.trace(MessageFormat.format(MessageConstant.QUERY_NO_DATA, DatabaseConstant.TABLE_FINANCIAL_FILE));
		}
		return optional.get();
	}

	public FinancialFile insert(FinancialFile entity) throws AlreadyExistException, FieldMissingException {
		if (!BaseAppUtil.isAllPresent(entity, entity.getUserId(), entity.getFilename(), entity.getType(), entity.getDate())) {
			throw new FieldMissingException();
		}
		return this.financialFileDao.save(entity);
	}

	public FinancialFile update(FinancialFile entity) throws NotExistException, FieldMissingException {
		if (!BaseAppUtil.isAllPresent(entity, entity.getId(), entity.getUserId(), entity.getFilename(), entity.getType(), entity.getDate())) {
			throw new FieldMissingException();
		}
		Optional<FinancialFile> optional = this.financialFileDao.findById(entity.getId());
		if (optional.isEmpty()) {
			throw new NotExistException();
		}
		FinancialFile updateEntity = optional.get();
		updateEntity.setUserId(entity.getUserId());
		updateEntity.setFilename(entity.getFilename());
		updateEntity.setType(entity.getType());
		updateEntity.setDate(entity.getDate());
		return this.financialFileDao.save(updateEntity);
	}

	public void delete(UUID id) throws NotExistException {
		if (!BaseAppUtil.isAllPresent(id)) {
			throw new NotExistException();
		}
		Optional<FinancialFile> optional = this.financialFileDao.findById(id);
		if (optional.isEmpty()) {
			throw new NotExistException();
		}
		this.financialFileDao.delete(optional.get());
	}
}
