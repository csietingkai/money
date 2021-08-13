from datetime import datetime
from pandas import DataFrame
from lib.stocker import Stocker

from facade import StockFacade, StockRecordFacade
from entity.Stock import Stock

def predict(stockCode: str, days: int = 10):
    print('[INFO] predicting stock<{stockCode}> for {days} days future...'.format(stockCode = stockCode, days = days))
    records = StockRecordFacade.queryByCode(stockCode)
    if len(records) > 0:
        columns = [c for c in filter(lambda name: (not name[0].startswith('_')), records[0].__dict__)]
        data = []
        for r in records:
            data.append([getattr(r, c) for c in columns])
        df = DataFrame(data, columns = columns)
        df = df.rename(columns={'deal_date': 'Date', 'open_price': 'Open', 'close_price': 'Close'})
        stocker = Stocker(stockCode, df)
        stocker.handle_dates(datetime(datetime.now().year, 1, 1), records[-1].deal_date)
        model, model_data = stocker.create_prophet_model(days = days)
        print(model_data.tail(days))
        return 'SUCCESS'
    return 'NO_DATA_FOR_TRAINING'
