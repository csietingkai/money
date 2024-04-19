package io.tingkai.money.facade;

import java.text.MessageFormat;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import io.tingkai.money.constant.DatabaseConstants;
import io.tingkai.money.constant.MessageConstant;
import io.tingkai.money.dao.OptionDao;
import io.tingkai.money.entity.Option;
import io.tingkai.money.model.exception.AlreadyExistException;
import io.tingkai.money.model.exception.FieldMissingException;
import io.tingkai.money.util.AppUtil;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class OptionFacade {

	@Autowired
	private OptionDao optionDao;

	public List<Option> queryAll(String catergory) {
		List<Option> entities = this.optionDao.findByCatergory(catergory);
		if (entities.size() == 0) {
			log.trace(MessageFormat.format(MessageConstant.QUERY_NO_DATA, DatabaseConstants.TABLE_OPTION));
		}
		return entities;
	}

	public Option insert(Option entity) throws FieldMissingException, AlreadyExistException {
		if (!AppUtil.isAllPresent(entity, entity.getCatergory(), entity.getName(), entity.getEnText(), entity.getTwText())) {
			throw new FieldMissingException();
		}
		Optional<Option> optional = this.optionDao.findByCatergoryAndName(entity.getCatergory(), entity.getName());
		if (optional.isPresent()) {
			throw new AlreadyExistException();
		}
		return this.optionDao.save(entity);
	}

	public long count() {
		return this.optionDao.count();
	}
}
