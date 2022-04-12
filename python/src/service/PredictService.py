from datetime import datetime
from io import open_code
import pandas as pd
from outsourcing.stocker import Stocker

from facade import StockRecordFacade, FundRecordFacade

def predictStock(stockCode: str, days: int = 10):
    print('[INFO] predicting stock<{stockCode}> for {days} days future...'.format(stockCode = stockCode, days = days))
    records = StockRecordFacade.queryByCode(stockCode)
    if len(records) > 0:
        data = []
        for r in records:
            data.append({
                'Date': r.deal_date,
                'Open': r.open_price,
                'High': r.high_price,
                'Low': r.low_price,
                'Close': r.close_price
            })
        df = pd.DataFrame(data)
        df = df.set_index(['Date'])
        stocker = Stocker(df, stockCode)
        stocker.handle_dates(datetime(datetime.now().year, 1, 1), records[-1].deal_date)
        model, model_data = stocker.create_prophet_model(days = days)
        yhat_lower = model_data.tail(days)['yhat_lower'].tolist()
        yhat = model_data.tail(days)['yhat'].tolist()
        yhat_upper = model_data.tail(days)['yhat_upper'].tolist()
        resultData = []
        for idx in range(days):
            resultData.append({
                'lower': yhat_lower[idx],
                'price': yhat[idx],
                'upper': yhat_upper[idx]
            })
        return { 'success': True, 'data': resultData, 'message': 'SUCCESS' }
    return { 'success': False, 'data': [], 'message': 'NO_DATA_FOR_TRAINING' }

def predictFund(fundCode: str, days: int = 10):
    print('[INFO] predicting fund<{fundCode}> for {days} days future...'.format(fundCode = fundCode, days = days))
    records = FundRecordFacade.queryByCode(fundCode)
    if len(records) > 0:
        data = []
        for r in records:
            data.append({
                'Date': r.date,
                'Open': r.price,
                'High': r.price,
                'Low': r.price,
                'Close': r.price
            })
        df = pd.DataFrame(data)
        df = df.set_index(['Date'])
        stocker = Stocker(df, fundCode)
        stocker.handle_dates(datetime(datetime.now().year, 1, 1), records[-1].date)
        model, model_data = stocker.create_prophet_model(days = days)
        yhat_lower = model_data.tail(days)['yhat_lower'].tolist()
        yhat = model_data.tail(days)['yhat'].tolist()
        yhat_upper = model_data.tail(days)['yhat_upper'].tolist()
        resultData = []
        for idx in range(days):
            resultData.append({
                'lower': yhat_lower[idx],
                'price': yhat[idx],
                'upper': yhat_upper[idx]
            })
        return { 'success': True, 'data': resultData, 'message': 'SUCCESS' }
    return { 'success': False, 'data': [], 'message': 'NO_DATA_FOR_TRAINING' }
