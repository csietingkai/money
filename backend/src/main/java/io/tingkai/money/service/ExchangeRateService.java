package io.tingkai.money.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.text.MessageFormat;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import io.tingkai.base.constant.BaseCodeConstant;
import io.tingkai.base.log.Loggable;
import io.tingkai.base.model.exception.AlreadyExistException;
import io.tingkai.base.model.exception.FieldMissingException;
import io.tingkai.base.model.exception.NotExistException;
import io.tingkai.base.util.BaseAppUtil;
import io.tingkai.money.constant.CodeConstant;
import io.tingkai.money.constant.MessageConstant;
import io.tingkai.money.entity.Account;
import io.tingkai.money.entity.AccountRecord;
import io.tingkai.money.entity.ExchangeRate;
import io.tingkai.money.entity.ExchangeRateRecord;
import io.tingkai.money.enumeration.option.RecordType;
import io.tingkai.money.facade.AccountFacade;
import io.tingkai.money.facade.AccountRecordFacade;
import io.tingkai.money.facade.ExchangeRateFacade;
import io.tingkai.money.facade.ExchangeRateRecordFacade;
import io.tingkai.money.model.exception.AccountBalanceNotEnoughException;
import io.tingkai.money.model.request.ExchangeRateTradeRequest;
import io.tingkai.money.model.vo.ExchangeRateRecordVo;
import io.tingkai.money.model.vo.ExchangeRateVo;

@Service
@Loggable
public class ExchangeRateService {

	@Autowired
	private ExchangeRateFacade exchangeRateFacade;

	@Autowired
	private ExchangeRateRecordFacade exchangeRateRecordFacade;

	@Autowired
	private AccountFacade accountFacade;

	@Autowired
	private AccountRecordFacade accountRecordFacade;

	@Autowired
	@Qualifier(CodeConstant.PYTHON_CACHE)
	private RedisTemplate<String, List<ExchangeRate>> cache;

	public List<ExchangeRateVo> getAll() {
		List<ExchangeRate> exchangeRates = this.cache.opsForValue().get(CodeConstant.EXCHANGE_RATE_LIST_KEY);
		if (BaseAppUtil.isEmpty(exchangeRates)) {
			exchangeRates = this.exchangeRateFacade.queryAll();
			this.cache.opsForValue().set(CodeConstant.EXCHANGE_RATE_LIST_KEY, exchangeRates);
		}
		List<ExchangeRateVo> vos = new ArrayList<ExchangeRateVo>();
		for (ExchangeRate exchangeRate : exchangeRates) {
			ExchangeRateVo vo = new ExchangeRateVo();
			vo.transform(exchangeRate);
			vo.setRecord(this.exchangeRateRecordFacade.latestRecord(exchangeRate.getCurrency()));
			vo.setUpdateTime(this.getUpdateTime(exchangeRate.getCurrency(), CodeConstant.EXCHANGE_RATE_FETCH_START_DATETIME));
			vos.add(vo);
		}
		return vos;
	}

	public List<ExchangeRateRecordVo> getAllRecords(String currency) {
		List<ExchangeRateRecord> records = this.exchangeRateRecordFacade.queryAll(currency);
		List<ExchangeRateRecordVo> vos = this.handleRecordMas(records);
		return vos;
	}

	@Transactional
	public void trade(ExchangeRateTradeRequest request) throws NotExistException, FieldMissingException, AccountBalanceNotEnoughException, AlreadyExistException {
		final UUID fromAccountId = request.getFromAccountId();
		final UUID toAccountId = request.getToAccountId();
		final LocalDateTime date = request.getDate().atStartOfDay();
		final BigDecimal rate = request.getRate();
		final BigDecimal srcPayment = request.getSrcPayment();
		final BigDecimal targetPayment = request.getTargetPayment();

		Account fromAccount = this.accountFacade.query(fromAccountId);
		Account toAccount = this.accountFacade.query(toAccountId);

		if (fromAccount.getBalance().compareTo(srcPayment) < 0) {
			throw new AccountBalanceNotEnoughException(fromAccount.getName());
		}

		fromAccount.setBalance(fromAccount.getBalance().subtract(srcPayment));
		this.accountFacade.update(fromAccount);

		toAccount.setBalance(toAccount.getBalance().add(targetPayment));
		this.accountFacade.update(toAccount);

		AccountRecord fromRecord = new AccountRecord();
		fromRecord.setTransDate(date);
		fromRecord.setTransAmount(BigDecimal.ZERO.subtract(srcPayment));
		fromRecord.setTransFrom(fromAccountId);
		fromRecord.setTransTo(fromAccountId);
		fromRecord.setRecordType(RecordType.INVEST);
		fromRecord.setDescription(MessageFormat.format(MessageConstant.EXCHANGE_RATE_TRADE, fromAccount.getName(), fromAccount.getCurrency(), toAccount.getName(), toAccount.getCurrency(), rate));
		this.accountRecordFacade.insert(fromRecord);

		AccountRecord toRecord = new AccountRecord();
		toRecord.setTransDate(date);
		toRecord.setTransAmount(targetPayment);
		toRecord.setTransFrom(toAccountId);
		toRecord.setTransTo(toAccountId);
		toRecord.setRecordType(RecordType.INVEST);
		toRecord.setDescription(MessageFormat.format(MessageConstant.EXCHANGE_RATE_TRADE, fromAccount.getName(), fromAccount.getCurrency(), toAccount.getName(), toAccount.getCurrency(), rate));
		this.accountRecordFacade.insert(toRecord);
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
			if (i >= CodeConstant.MA_DAYS[di] - 1) {
				vo.setMa5(sums[di].divide(BigDecimal.valueOf(CodeConstant.MA_DAYS[di])));
				sums[di] = sums[di].subtract(records.get(i - CodeConstant.MA_DAYS[di] + 1).getCashSell());
			}
			di++;
			if (i >= CodeConstant.MA_DAYS[di] - 1) {
				vo.setMa10(sums[di].divide(BigDecimal.valueOf(CodeConstant.MA_DAYS[di])));
				sums[di] = sums[di].subtract(records.get(i - CodeConstant.MA_DAYS[di] + 1).getCashSell());
			}
			di++;
			if (i >= CodeConstant.MA_DAYS[di] - 1) {
				BigDecimal ma20 = sums[di].divide(BigDecimal.valueOf(CodeConstant.MA_DAYS[di]));
				// standard deviaction
				BigDecimal total = BigDecimal.ZERO;
				for (int j = 0; j < CodeConstant.MA_DAYS[di]; j++) {
					total = total.add(BigDecimal.valueOf(Math.pow(records.get(i - j).getCashSell().subtract(ma20).doubleValue(), 2)));
				}
				double standardDeviaction = Math.sqrt(total.divide(BigDecimal.valueOf(CodeConstant.MA_DAYS[di]), BaseCodeConstant.NUMBER_PERCISION, RoundingMode.HALF_UP).doubleValue());
				vo.setMa20(ma20);
				vo.setBbup(ma20.add(BigDecimal.valueOf(standardDeviaction)).add(BigDecimal.valueOf(standardDeviaction)).setScale(BaseCodeConstant.NUMBER_PERCISION, RoundingMode.HALF_UP));
				vo.setBbdown(ma20.subtract(BigDecimal.valueOf(standardDeviaction)).subtract(BigDecimal.valueOf(standardDeviaction)).setScale(BaseCodeConstant.NUMBER_PERCISION, RoundingMode.HALF_UP));
				sums[di] = sums[di].subtract(records.get(i - CodeConstant.MA_DAYS[di] + 1).getCashSell());
			}
			di++;
			if (i >= CodeConstant.MA_DAYS[di] - 1) {
				vo.setMa40(sums[di].divide(BigDecimal.valueOf(CodeConstant.MA_DAYS[di])));
				sums[di] = sums[di].subtract(records.get(i - CodeConstant.MA_DAYS[di] + 1).getCashSell());
			}
			di++;
			if (i >= CodeConstant.MA_DAYS[di] - 1) {
				vo.setMa60(sums[di].divide(BigDecimal.valueOf(CodeConstant.MA_DAYS[di]), 5, RoundingMode.HALF_UP));
				sums[di] = sums[di].subtract(records.get(i - CodeConstant.MA_DAYS[di] + 1).getCashSell());
			}
			vos.add(vo);
		}
		return vos;
	}

	private LocalDateTime getUpdateTime(String currency, LocalDateTime defaultTime) {
		ExchangeRateRecord record = this.exchangeRateRecordFacade.latestRecord(currency);
		if (BaseAppUtil.isPresent(record)) {
			return record.getDate();
		}
		return defaultTime;
	}
}
