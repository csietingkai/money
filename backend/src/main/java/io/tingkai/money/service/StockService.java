package io.tingkai.money.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import io.tingkai.base.constant.BaseCodeConstant;
import io.tingkai.base.log.Loggable;
import io.tingkai.base.util.BaseAppUtil;
import io.tingkai.base.util.BaseStringUtil;
import io.tingkai.money.constant.CodeConstant;
import io.tingkai.money.entity.Stock;
import io.tingkai.money.entity.StockRecord;
import io.tingkai.money.facade.StockFacade;
import io.tingkai.money.facade.StockRecordFacade;
import io.tingkai.money.model.vo.StockRecordVo;
import io.tingkai.money.model.vo.StockVo;

@Service
@Loggable
public class StockService {

	@Autowired
	private StockFacade stockFacade;

	@Autowired
	private StockRecordFacade stockRecordFacade;

	public List<StockVo> getAll(String code, String name, boolean sort) {
		List<Stock> stocks = this.stockFacade.queryAll(sort);
		List<StockVo> vos = new ArrayList<StockVo>();
		for (Stock stock : stocks) {
			if ((!BaseStringUtil.isBlank(code) && !stock.getCode().equals(code)) || (!BaseStringUtil.isBlank(name) && !stock.getName().toUpperCase().contains(name.toUpperCase()))) {
				continue;
			}
			StockVo vo = new StockVo();
			vo.transform(stock);
			vo.setUpdateTime(this.getUpdateTime(stock.getCode(), stock.getOfferingDate()));
			vos.add(vo);
		}
		if (vos.size() == 0) {
			StockVo vo = this.get(code);
			if (BaseAppUtil.isPresent(vo)) {
				vos.add(vo);
			}
		}
		return vos;
	}

	public StockVo get(String code) {
		Stock stock = this.stockFacade.query(code);
		StockVo vo = new StockVo();
		vo.transform(stock);
		vo.setUpdateTime(this.getUpdateTime(stock.getCode(), stock.getOfferingDate()));
		return vo;
	}

	public List<StockRecordVo> getAllRecords(String code) {
		List<StockRecord> records = this.stockRecordFacade.queryAll(code);
		List<StockRecordVo> vos = this.handleRecordMas(records);
		return vos;
	}

	private List<StockRecordVo> handleRecordMas(List<StockRecord> records) {
		List<StockRecordVo> vos = new ArrayList<StockRecordVo>();

		BigDecimal[] sums = { BigDecimal.ZERO, BigDecimal.ZERO, BigDecimal.ZERO, BigDecimal.ZERO, BigDecimal.ZERO };

		for (int i = 0; i < records.size(); i++) {
			StockRecord record = records.get(i);
			StockRecordVo vo = new StockRecordVo();
			vo.transform(record);
			for (int j = 0; j < sums.length; j++) {
				sums[j] = sums[j].add(record.getClosePrice());
			}
			int di = 0;
			if (i >= CodeConstant.MA_DAYS[di] - 1) {
				vo.setMa5(sums[di].divide(BigDecimal.valueOf(CodeConstant.MA_DAYS[di])));
				sums[di] = sums[di].subtract(records.get(i - CodeConstant.MA_DAYS[di] + 1).getClosePrice());
			}
			di++;
			if (i >= CodeConstant.MA_DAYS[di] - 1) {
				vo.setMa10(sums[di].divide(BigDecimal.valueOf(CodeConstant.MA_DAYS[di])));
				sums[di] = sums[di].subtract(records.get(i - CodeConstant.MA_DAYS[di] + 1).getClosePrice());
			}
			di++;
			if (i >= CodeConstant.MA_DAYS[di] - 1) {
				BigDecimal ma20 = sums[di].divide(BigDecimal.valueOf(CodeConstant.MA_DAYS[di]));
				// standard deviaction
				BigDecimal total = BigDecimal.ZERO;
				for (int j = 0; j < CodeConstant.MA_DAYS[di]; j++) {
					total = total.add(BigDecimal.valueOf(Math.pow(records.get(i - j).getClosePrice().subtract(ma20).doubleValue(), 2)));
				}
				double standardDeviaction = Math.sqrt(total.divide(BigDecimal.valueOf(CodeConstant.MA_DAYS[di]), BaseCodeConstant.NUMBER_PERCISION, RoundingMode.HALF_UP).doubleValue());
				vo.setMa20(ma20);
				vo.setBbup(ma20.add(BigDecimal.valueOf(standardDeviaction)).add(BigDecimal.valueOf(standardDeviaction)).setScale(BaseCodeConstant.NUMBER_PERCISION, RoundingMode.HALF_UP));
				vo.setBbdown(ma20.subtract(BigDecimal.valueOf(standardDeviaction)).subtract(BigDecimal.valueOf(standardDeviaction)).setScale(BaseCodeConstant.NUMBER_PERCISION, RoundingMode.HALF_UP));
				sums[di] = sums[di].subtract(records.get(i - CodeConstant.MA_DAYS[di] + 1).getClosePrice());
			}
			di++;
			if (i >= CodeConstant.MA_DAYS[di] - 1) {
				vo.setMa40(sums[di].divide(BigDecimal.valueOf(CodeConstant.MA_DAYS[di])));
				sums[di] = sums[di].subtract(records.get(i - CodeConstant.MA_DAYS[di] + 1).getClosePrice());
			}
			di++;
			if (i >= CodeConstant.MA_DAYS[di] - 1) {
				vo.setMa60(sums[di].divide(BigDecimal.valueOf(CodeConstant.MA_DAYS[di]), BaseCodeConstant.NUMBER_PERCISION, RoundingMode.HALF_UP));
				sums[di] = sums[di].subtract(records.get(i - CodeConstant.MA_DAYS[di] + 1).getClosePrice());
			}
			vos.add(vo);
		}
		return vos;
	}

	private LocalDateTime getUpdateTime(String code, LocalDateTime defaultTime) {
		StockRecord record = this.stockRecordFacade.latestRecord(code);
		if (BaseAppUtil.isPresent(record)) {
			return record.getDealDate();
		}
		return defaultTime;
	}
}
