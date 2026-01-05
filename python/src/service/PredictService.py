import pandas as pd

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
        resultData = []
        # TODO predict
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
        resultData = []
        # TODO predict
        return { 'success': True, 'data': resultData, 'message': 'SUCCESS' }
    return { 'success': False, 'data': [], 'message': 'NO_DATA_FOR_TRAINING' }
