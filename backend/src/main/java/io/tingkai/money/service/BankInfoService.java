package io.tingkai.money.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import io.tingkai.money.constant.CodeConstants;
import io.tingkai.money.entity.BankInfo;
import io.tingkai.money.facade.BankInfoFacade;
import io.tingkai.money.logging.Loggable;
import io.tingkai.money.util.AppUtil;

@Service
@Loggable
public class BankInfoService {

	@Autowired
	private BankInfoFacade bankInfoFacade;

	@Autowired
	@Qualifier(CodeConstants.PYTHON_CACHE)
	private RedisTemplate<String, List<BankInfo>> cache;

	public List<BankInfo> getAll() {
		List<BankInfo> vos = cache.opsForValue().get(CodeConstants.BANK_INFO_LIST_KEY);
		if (AppUtil.isEmpty(vos)) {
			vos = this.bankInfoFacade.queryAll();
			cache.opsForValue().set(CodeConstants.BANK_INFO_LIST_KEY, vos);
		}
		return vos;
	}
}
