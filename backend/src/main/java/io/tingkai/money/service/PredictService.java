package io.tingkai.money.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import io.tingkai.money.constant.AppConstants;
import io.tingkai.money.constant.CodeConstants;
import io.tingkai.money.logging.Loggable;
import io.tingkai.money.model.vo.PredictResultVo;
import io.tingkai.money.util.AppUtil;

@Service
@Loggable
public class PredictService {

	private static final String PYTHON_PREDICT_PATH_PREFIX = "/predict";
	private static final String PYTHON_PREDICT_STOCK_PATH = PYTHON_PREDICT_PATH_PREFIX + "/stock";
	private static final String PYTHON_PREDICT_FUND_PATH = PYTHON_PREDICT_PATH_PREFIX + "/fund";

	@Autowired
	private RestTemplate restTemplate;

	public List<PredictResultVo> predictStock(String code, int days) {
		// @formatter:off
		UriComponentsBuilder builder = UriComponentsBuilder
				.fromHttpUrl(AppConstants.PYTHON_BASE_URL + PYTHON_PREDICT_STOCK_PATH)
				.queryParam("code", code)
				.queryParam("days", days);
		// @formatter:on
		JSONObject response = this.restTemplate.getForObject(builder.toUriString(), JSONObject.class);
		List<PredictResultVo> vos = handlePredictResponse(response);
		return vos;
	}

	public List<PredictResultVo> predictFund(String code, int days) {
		// @formatter:off
		UriComponentsBuilder builder = UriComponentsBuilder
				.fromHttpUrl(AppConstants.PYTHON_BASE_URL + PYTHON_PREDICT_FUND_PATH)
				.queryParam("code", code)
				.queryParam("days", days);
		// @formatter:on
		JSONObject response = this.restTemplate.getForObject(builder.toUriString(), JSONObject.class);
		List<PredictResultVo> vos = handlePredictResponse(response);
		return vos;
	}

	@SuppressWarnings("unchecked")
	private List<PredictResultVo> handlePredictResponse(JSONObject response) {
		List<PredictResultVo> vos = new ArrayList<PredictResultVo>();
		if (AppUtil.isPresent(response.get("data"))) {
			Object data = response.get("data");
			if (data instanceof List<?>) {
				List<Map<String, Double>> list = (List<Map<String, Double>>) data;
				for (Map<String, Double> map : list) {
					PredictResultVo vo = new PredictResultVo();
					vo.setLower(BigDecimal.valueOf(map.get("lower")));
					vo.setPrice(BigDecimal.valueOf(map.get("price")));
					vo.setUpper(BigDecimal.valueOf(map.get("upper")));
					vos.add(vo);
				}
			}
			for (PredictResultVo vo : vos) {
				vo.setLower(vo.getLower().setScale(CodeConstants.NUMBER_PERCISION, RoundingMode.HALF_UP));
				vo.setPrice(vo.getPrice().setScale(CodeConstants.NUMBER_PERCISION, RoundingMode.HALF_UP));
				vo.setUpper(vo.getUpper().setScale(CodeConstants.NUMBER_PERCISION, RoundingMode.HALF_UP));
			}
		}
		return vos;
	}
}
