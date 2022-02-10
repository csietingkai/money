from datetime import datetime
from io import open_code
import pandas as pd
from outsourcing.stocker import Stocker

from facade import StockFacade, StockRecordFacade
from entity.Stock import Stock

def predict(stockCode: str, days: int = 10):
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
        print(df)
        stocker = Stocker(df, stockCode)
        stocker.handle_dates(datetime(datetime.now().year, 1, 1), records[-1].deal_date)
        model, model_data = stocker.create_prophet_model(days = days)
        print(model_data.tail(days))
        return 'SUCCESS'
    return 'NO_DATA_FOR_TRAINING'
