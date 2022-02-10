package io.tingkai.money.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import io.tingkai.money.constant.CodeConstants;
import io.tingkai.money.entity.ExchangeRate;
import io.tingkai.money.entity.ExchangeRateRecord;
import io.tingkai.money.facade.ExchangeRateFacade;
import io.tingkai.money.facade.ExchangeRateRecordFacade;
import io.tingkai.money.logging.Loggable;
import io.tingkai.money.model.exception.NotExistException;
import io.tingkai.money.model.vo.ExchangeRateRecordVo;
import io.tingkai.money.model.vo.ExchangeRateVo;
import io.tingkai.money.util.AppUtil;

@Service
@Loggable
public class ExchangeRateService {

	@Autowired
	private ExchangeRateFacade exchangeRateFacade;

	@Autowired
	private ExchangeRateRecordFacade exchangeRateRecordFacade;

	@Autowired
	@Qualifier(CodeConstants.PYTHON_CACHE)
	private RedisTemplate<String, List<ExchangeRate>> cache;

	public List<ExchangeRateVo> getAll() {
		List<ExchangeRate> exchangeRates = cache.opsForValue().get(CodeConstants.EXCHANGE_RATE_LIST_KEY);
		if (AppUtil.isEmpty(exchangeRates)) {
			exchangeRates = this.exchangeRateFacade.queryAll();
			cache.opsForValue().set(CodeConstants.EXCHANGE_RATE_LIST_KEY, exchangeRates);
		}
		List<ExchangeRateVo> vos = new ArrayList<ExchangeRateVo>();
		for (ExchangeRate exchangeRate : exchangeRates) {
			ExchangeRateVo vo = new ExchangeRateVo();
			vo.transform(exchangeRate);
			vo.setRecord(this.exchangeRateRecordFacade.latestRecord(exchangeRate.getCurrency()));
			vo.setUpdateTime(this.getUpdateTime(exchangeRate.getCurrency(), CodeConstants.EXCHANGE_RATE_FETCH_START_DATETIME));
			vos.add(vo);
		}
		return vos;
	}

	public List<ExchangeRateRecordVo> getAllRecords(String currency) {
		List<ExchangeRateRecord> records = this.exchangeRateRecordFacade.queryAll(currency);
		List<ExchangeRateRecordVo> vos = this.handleRecordMas(records);
		return vos;
	}

	public List<ExchangeRateRecordVo> getAllRecords(String currency, long start, long end) {
		List<ExchangeRateRecord> records = new ArrayList<ExchangeRateRecord>();
		int removeSize = 0;
		try {
			records.addAll(this.exchangeRateRecordFacade.queryDaysBefore(currency, CodeConstants.MA_DAYS[CodeConstants.MA_DAYS.length - 1], start));
			removeSize = records.size();
		} catch (Exception e) {
		}
		records.addAll(this.exchangeRateRecordFacade.queryAll(currency, start, end));
		List<ExchangeRateRecordVo> vos = this.handleRecordMas(records);
		vos = vos.subList(removeSize, vos.size());
		return vos;
	}

	public void delete(String id) throws NotExistException {
		this.exchangeRateFacade.delete(id);
	}

	private List<ExchangeRateRecordVo> handleRecordMas(List<ExchangeRateRecord> records) {
		List<ExchangeRateRecordVo> vos = new ArrayList<ExchangeRateRecordVo>();

		BigDecimal[] sums = { BigDecimal.ZERO, BigDecimal.ZERO, BigDecimal.ZERO, BigDecimal.ZERO, BigDecimal.ZERO };

		for (int i = 0; i < records.size(); i++) {
			ExchangeRateRecord record = records.get(i);
			ExchangeRateRecordVo vo = new ExchangeRateRecordVo();
			vo.transform(record);
			for (int j = 0; j < sums.length; j++) {
				sums[j] = sums[j].add(record.getCashSell());
			}
			int di = 0;
			if (i >= CodeConstants.MA_DAYS[di] - 1) {
				vo.setMa5(sums[di].divide(BigDecimal.valueOf(CodeConstants.MA_DAYS[di])));
				sums[di] = sums[di].subtract(records.get(i - CodeConstants.MA_DAYS[di] + 1).getCashSell());
			}
			di++;
			if (i >= CodeConstants.MA_DAYS[di] - 1) {
				vo.setMa10(sums[di].divide(BigDecimal.valueOf(CodeConstants.MA_DAYS[di])));
				sums[di] = sums[di].subtract(records.get(i - CodeConstants.MA_DAYS[di] + 1).getCashSell());
			}
			di++;
			if (i >= CodeConstants.MA_DAYS[di] - 1) {
				BigDecimal ma20 = sums[di].divide(BigDecimal.valueOf(CodeConstants.MA_DAYS[di]));
				// standard deviaction
				BigDecimal total = BigDecimal.ZERO;
				for (int j = 0; j < CodeConstants.MA_DAYS[di]; j++) {
					total = total.add(BigDecimal.valueOf(Math.pow(records.get(i - j).getCashSell().subtract(ma20).doubleValue(), 2)));
				}
				double standardDeviaction = Math.sqrt(total.divide(BigDecimal.valueOf(CodeConstants.MA_DAYS[di]), CodeConstants.NUMBER_PERCISION, RoundingMode.HALF_UP).doubleValue());
				vo.setMa20(ma20);
				vo.setBbup(ma20.add(BigDecimal.valueOf(standardDeviaction)).add(BigDecimal.valueOf(standardDeviaction)).setScale(CodeConstants.NUMBER_PERCISION, RoundingMode.HALF_UP));
				vo.setBbdown(ma20.subtract(BigDecimal.valueOf(standardDeviaction)).subtract(BigDecimal.valueOf(standardDeviaction)).setScale(CodeConstants.NUMBER_PERCISION, RoundingMode.HALF_UP));
				sums[di] = sums[di].subtract(records.get(i - CodeConstants.MA_DAYS[di] + 1).getCashSell());
			}
			di++;
			if (i >= CodeConstants.MA_DAYS[di] - 1) {
				vo.setMa40(sums[di].divide(BigDecimal.valueOf(CodeConstants.MA_DAYS[di])));
				sums[di] = sums[di].subtract(records.get(i - CodeConstants.MA_DAYS[di] + 1).getCashSell());
			}
			di++;
			if (i >= CodeConstants.MA_DAYS[di] - 1) {
				vo.setMa60(sums[di].divide(BigDecimal.valueOf(CodeConstants.MA_DAYS[di]), 5, RoundingMode.HALF_UP));
				sums[di] = sums[di].subtract(records.get(i - CodeConstants.MA_DAYS[di] + 1).getCashSell());
			}
			vos.add(vo);
		}
		return vos;
	}

	private LocalDateTime getUpdateTime(String currency, LocalDateTime defaultTime) {
		ExchangeRateRecord record = this.exchangeRateRecordFacade.latestRecord(currency);
		if (AppUtil.isPresent(record)) {
			return record.getDate();
		}
		return defaultTime;
	}
}
