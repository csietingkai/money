package io.tingkai.money.service;

import java.text.MessageFormat;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import io.tingkai.auth.util.ContextUtil;
import io.tingkai.base.enumeration.Lang;
import io.tingkai.base.log.Loggable;
import io.tingkai.base.util.BaseAppUtil;
import io.tingkai.base.util.I18nUtil;
import io.tingkai.money.constant.CodeConstant;
import io.tingkai.money.entity.Option;
import io.tingkai.money.entity.UserSetting;
import io.tingkai.money.facade.OptionFacade;
import io.tingkai.money.facade.UserSettingFacade;
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
	private UserSettingFacade userSettingFacade;

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
		UserSetting userSetting = userSettingFacade.queryByUserId(ContextUtil.getUserId());
		Lang lang = userSetting.getLang();
		String key = MessageFormat.format("{0}-{1}", lang.name(), catergory);
		List<OptionVo> options = this.appCache.opsForValue().get(key);
		if (BaseAppUtil.isEmpty(options)) {
			List<Option> entities = this.optionFacade.queryAll(catergory);
			options = entities.stream().map(o -> OptionVo.of(o.getName(), I18nUtil.getMessage(lang, o.getI18nKey()))).collect(Collectors.toList());
			this.appCache.opsForValue().set(key, options);
		}
		return options;
	}
}
