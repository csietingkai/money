package io.tingkai.money.service;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Component;

import io.tingkai.money.constant.CodeConstants;
import io.tingkai.money.dao.StockDao;
import io.tingkai.money.dao.StockRecordDao;
import io.tingkai.money.entity.Stock;
import io.tingkai.money.logging.Loggable;
import io.tingkai.money.util.AppUtil;
import lombok.extern.slf4j.Slf4j;

@Component
@Loggable
@Slf4j
public class ScheduleTaskService {

	@Autowired
	private StockDao stockDao;

	@Autowired
	private StockRecordDao stockRecordDao;

	@Autowired
	private PythonFetcherService pythonFetcherService;

	@Autowired
	@Qualifier(CodeConstants.PYTHON_CACHE)
	private RedisTemplate<String, String> fetchingStockCache;

	@Autowired
	@Qualifier(CodeConstants.PYTHON_CACHE)
	private RedisTemplate<String, Set<String>> skipStockCache;

//	@Scheduled(cron = "0/30 * * * * *") // every 30 seconds
	public void fetchStockRecord() {
		Set<String> skipList = this.skipStockCache.opsForValue().get(CodeConstants.STOCK_SKIP_FETCH_LIST_KEY);
		if (AppUtil.isEmpty(this.fetchingStockCache.opsForValue().get(CodeConstants.STOCK_FETCHING_CODE))) {
			List<String> noRecordCodes = this.getNoRecordCodes();
			noRecordCodes = noRecordCodes.stream().filter(x -> !skipList.contains(x)).collect(Collectors.toList());
			if (noRecordCodes.size() > 0) {
				String code = noRecordCodes.get(0);
				this.fetchingStockCache.opsForValue().set(CodeConstants.STOCK_FETCHING_CODE, code);
				log.info("Scheduled Fetch Stock<" + code + "> Records");
				this.pythonFetcherService.fetchStockRecord(code);
				this.fetchingStockCache.delete(CodeConstants.STOCK_FETCHING_CODE);
			}
		}
	}

	private List<String> getNoRecordCodes() {
		List<String> distinctCodes = new ArrayList<String>();
		Iterable<String> iterable = this.stockRecordDao.findDistinctCode();
		iterable.forEach(distinctCodes::add);
		Iterable<Stock> stockIterable = this.stockDao.findByCodeNotIn(distinctCodes);
		List<String> noRecordCodes = new ArrayList<String>();
		stockIterable.forEach(x -> {
			noRecordCodes.add(x.getCode());
		});
		return noRecordCodes;
	}
}
