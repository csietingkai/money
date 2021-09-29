package io.tingkai.money.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import io.tingkai.money.constant.CodeConstants;
import io.tingkai.money.entity.Fund;
import io.tingkai.money.entity.FundRecord;
import io.tingkai.money.facade.FundFacade;
import io.tingkai.money.facade.FundRecordFacade;
import io.tingkai.money.logging.Loggable;
import io.tingkai.money.model.exception.QueryNotResultException;
import io.tingkai.money.model.vo.FundRecordVo;
import io.tingkai.money.model.vo.FundVo;
import io.tingkai.money.util.AppUtil;
import io.tingkai.money.util.StringUtil;
import lombok.extern.slf4j.Slf4j;

@Service
@Loggable
@Slf4j
public class FundService {

	@Autowired
	private FundFacade fundFacade;

	@Autowired
	private FundRecordFacade fundRecordFacade;

	public List<FundVo> getAll(String code, String name, boolean sort) throws QueryNotResultException {
		List<Fund> funds = this.fundFacade.queryAll(sort);
		List<FundVo> vos = new ArrayList<FundVo>();
		for (Fund fund : funds) {
			if ((!StringUtil.isBlank(code) && !fund.getCode().equals(code)) || (!StringUtil.isBlank(name) && !fund.getName().toUpperCase().contains(name.toUpperCase()))) {
				continue;
			}
			FundVo vo = new FundVo();
			vo.transform(fund);
			vo.setUpdateTime(this.getUpdateTime(fund.getCode(), fund.getOfferingDate()));
			vos.add(vo);
		}
		if (vos.size() == 0) {
			FundVo vo = this.get(code);
			if (AppUtil.isPresent(vo)) {
				vos.add(vo);
			}
		}
		return vos;
	}

	public FundVo get(String code) throws QueryNotResultException {
		Fund fund = this.fundFacade.query(code);
		FundVo vo = new FundVo();
		vo.transform(fund);
		vo.setUpdateTime(this.getUpdateTime(fund.getCode(), fund.getOfferingDate()));
		return vo;
	}

	public List<FundRecordVo> getAllRecords(String code) throws QueryNotResultException {
		List<FundRecord> records = this.fundRecordFacade.queryAll(code);
		List<FundRecordVo> vos = this.handleRecordMas(records);
		return vos;
	}

	public List<FundRecordVo> getAllRecords(String code, long start, long end) throws QueryNotResultException {
		List<FundRecord> records = new ArrayList<FundRecord>();
		int removeSize = 0;
		try {
			records.addAll(this.fundRecordFacade.queryDaysBefore(code, CodeConstants.MA_DAYS[CodeConstants.MA_DAYS.length - 1], start));
			removeSize = records.size();
		} catch (Exception e) {
		}
		records.addAll(this.fundRecordFacade.queryAll(code, start, end));
		List<FundRecordVo> vos = this.handleRecordMas(records);
		vos = vos.subList(removeSize, vos.size());
		return vos;
	}

	private List<FundRecordVo> handleRecordMas(List<FundRecord> records) {
		List<FundRecordVo> vos = new ArrayList<FundRecordVo>();

		BigDecimal[] sums = { BigDecimal.ZERO, BigDecimal.ZERO, BigDecimal.ZERO, BigDecimal.ZERO, BigDecimal.ZERO };

		for (int i = 0; i < records.size(); i++) {
			FundRecord record = records.get(i);
			FundRecordVo vo = new FundRecordVo();
			vo.transform(record);
			for (int j = 0; j < sums.length; j++) {
				sums[j] = sums[j].add(record.getPrice());
			}
			int di = 0;
			if (i >= CodeConstants.MA_DAYS[di] - 1) {
				vo.setMa5(sums[di].divide(BigDecimal.valueOf(CodeConstants.MA_DAYS[di])));
				sums[di] = sums[di].subtract(records.get(i - CodeConstants.MA_DAYS[di] + 1).getPrice());
			}
			di++;
			if (i >= CodeConstants.MA_DAYS[di] - 1) {
				vo.setMa10(sums[di].divide(BigDecimal.valueOf(CodeConstants.MA_DAYS[di])));
				sums[di] = sums[di].subtract(records.get(i - CodeConstants.MA_DAYS[di] + 1).getPrice());
			}
			di++;
			if (i >= CodeConstants.MA_DAYS[di] - 1) {
				BigDecimal ma20 = sums[di].divide(BigDecimal.valueOf(CodeConstants.MA_DAYS[di]));
				// standard deviaction
				BigDecimal total = BigDecimal.ZERO;
				for (int j = 0; j < CodeConstants.MA_DAYS[di]; j++) {
					total = total.add(BigDecimal.valueOf(Math.pow(records.get(i - j).getPrice().subtract(ma20).doubleValue(), 2)));
				}
				double standardDeviaction = Math.sqrt(total.divide(BigDecimal.valueOf(CodeConstants.MA_DAYS[di]), CodeConstants.NUMBER_PERCISION, RoundingMode.HALF_UP).doubleValue());
				vo.setMa20(ma20);
				vo.setBbup(ma20.add(BigDecimal.valueOf(standardDeviaction)).add(BigDecimal.valueOf(standardDeviaction)).setScale(CodeConstants.NUMBER_PERCISION, RoundingMode.HALF_UP));
				vo.setBbdown(ma20.subtract(BigDecimal.valueOf(standardDeviaction)).subtract(BigDecimal.valueOf(standardDeviaction)).setScale(CodeConstants.NUMBER_PERCISION, RoundingMode.HALF_UP));
				sums[di] = sums[di].subtract(records.get(i - CodeConstants.MA_DAYS[di] + 1).getPrice());
			}
			di++;
			if (i >= CodeConstants.MA_DAYS[di] - 1) {
				vo.setMa40(sums[di].divide(BigDecimal.valueOf(CodeConstants.MA_DAYS[di])));
				sums[di] = sums[di].subtract(records.get(i - CodeConstants.MA_DAYS[di] + 1).getPrice());
			}
			di++;
			if (i >= CodeConstants.MA_DAYS[di] - 1) {
				vo.setMa60(sums[di].divide(BigDecimal.valueOf(CodeConstants.MA_DAYS[di]), CodeConstants.NUMBER_PERCISION, RoundingMode.HALF_UP));
				sums[di] = sums[di].subtract(records.get(i - CodeConstants.MA_DAYS[di] + 1).getPrice());
			}
			vos.add(vo);
		}
		return vos;
	}

	private LocalDateTime getUpdateTime(String code, LocalDateTime defaultTime) {
		FundRecord record = null;
		try {
			record = this.fundRecordFacade.latestRecord(code);
			return record.getDate();
		} catch (QueryNotResultException e) {
			log.debug(e.getMessage());
		}
		return defaultTime;
	}
}
