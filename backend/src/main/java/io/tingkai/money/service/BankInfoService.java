package io.tingkai.money.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import io.tingkai.base.log.Loggable;
import io.tingkai.base.util.BaseAppUtil;
import io.tingkai.money.constant.CodeConstant;
import io.tingkai.money.entity.BankInfo;
import io.tingkai.money.facade.BankInfoFacade;


@Service
@Loggable
public class BankInfoService {

	@Autowired
	private BankInfoFacade bankInfoFacade;

	@Autowired
	@Qualifier(CodeConstant.PYTHON_CACHE)
	private RedisTemplate<String, List<BankInfo>> cache;

	public List<BankInfo> getAll() {
		List<BankInfo> vos = cache.opsForValue().get(CodeConstant.BANK_INFO_LIST_KEY);
		if (BaseAppUtil.isEmpty(vos)) {
			vos = this.bankInfoFacade.queryAll();
			cache.opsForValue().set(CodeConstant.BANK_INFO_LIST_KEY, vos);
		}
		return vos;
	}
}
