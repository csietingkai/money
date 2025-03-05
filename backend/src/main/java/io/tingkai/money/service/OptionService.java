package io.tingkai.money.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import io.tingkai.base.log.Loggable;
import io.tingkai.base.util.BaseAppUtil;
import io.tingkai.money.constant.CodeConstant;
import io.tingkai.money.entity.Option;
import io.tingkai.money.facade.OptionFacade;
import io.tingkai.money.model.vo.OptionVo;

@Service
@Loggable
public class OptionService {

	public static final String FILE_TYPE = "FILE_TYPE";
	public static final String STOCK_TYPE = "STOCK_TYPE";
	public static final String RECORD_TYPE = "RECORD_TYPE";

	@Autowired
	private OptionFacade optionFacade;

	@Autowired
	@Qualifier(CodeConstant.APP_CACHE)
	private RedisTemplate<String, List<OptionVo>> appCache;

	public List<OptionVo> getFileTypeOptions() {
		List<OptionVo> options = this.syncCache(FILE_TYPE);
		return options;
	}

	public List<OptionVo> getStockTypeOptions() {
		List<OptionVo> options = this.syncCache(STOCK_TYPE);
		return options;
	}

	public List<OptionVo> getRecordTypeOptions() {
		List<OptionVo> options = this.syncCache(RECORD_TYPE);
		return options;
	}

	private List<OptionVo> syncCache(String catergory) {
		List<OptionVo> options = this.appCache.opsForValue().get(catergory);
		if (BaseAppUtil.isEmpty(options)) {
			List<Option> entities = this.optionFacade.queryAll(catergory);
			options = entities.stream().map(o -> {
				// TODO i18n
				String text = o.getTwText();
				return OptionVo.of(o.getName(), text);
			}).collect(Collectors.toList());
			this.appCache.opsForValue().set(catergory, options);
		}
		return options;
	}
}
