from contextlib import closing
import csv
import datetime
import io
import urllib

from entity.ExchangeRateRecord import ExchangeRateRecord
from facade import ExchangeRateRecordFacade
from util import CodeConstant

def fetchAllExchangeRateRecord(currency: str):
    try:
        print('[INFO] fetching exhcnage rate <{currency}>'.format(currency = currency))
        now = datetime.datetime.now()
        target = datetime.datetime(datetime.datetime.now().year - 1, 1, 1)
        records = ExchangeRateRecordFacade.queryByCurrency(currency)
        if len(records) > 0:
            lastRecord = records[-1]
            target = lastRecord.date
            target += datetime.timedelta(days = 1)

        while target.year * 12 + target.month <= now.year * 12 + now.month:
            print('[DEBUG] fetching exhcnage rate <{currency}> {year}/{month} data...'.format(currency = currency, year = target.year, month = target.month))
            url = CodeConstant.EXCHANGE_RATE_RECORD_URL.format(year = str(target.year), month = str(target.month).zfill(2), currency = currency)
            url_open = urllib.request.urlopen(url)
            csvfile = csv.reader(io.StringIO(url_open.read().decode('utf-8')), delimiter=',')
            skipFirstRow = False
            for row in csvfile:
                if not skipFirstRow:
                    skipFirstRow = True
                    continue
                entity = ExchangeRateRecord()
                entity.currency = currency
                year = int(row[0][0:4])
                month = int(row[0][4:6])
                day = int(row[0][6:8])
                rowDate = datetime.datetime(year, month, day)
                if rowDate < target:
                    continue
                entity.date = rowDate
                entity.cash_buy = float(row[3])
                entity.cash_sell = float(row[13])
                entity.spot_buy = float(row[4])
                entity.spot_sell = float(row[14])
                ExchangeRateRecordFacade.insert(entity)
            if target.month == 12:
                target = datetime.datetime(target.year + 1, 1, 1)
            else:
                target = datetime.datetime(target.year, target.month + 1, 1)
        return 'SUCCESS'
    except Exception as e:
        return str(e)
