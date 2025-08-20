import datetime
import requests
import yfinance as yf

from entity.Fund import Fund
from entity.FundRecord import FundRecord
from facade import FundFacade, FundRecordFacade
from util import AppUtil, CodeConstant

def fetchFund(targetCode):
    response = requests.post(CodeConstant.FUND_LIST_URL, json={'order': 'isincode-asc', 'keyword': targetCode}, headers={'User-Agent': 'Mozilla/5.0'})
    response = response.json()
    hasResult = len(response['items']) > 0
    if hasResult:
        item = response['items'][0]
        entity = Fund()
        # skip if already exist
        code = item['fundId']
        queryEntity = FundFacade.queryByCode(code)
        if queryEntity:
            print('[INFO] fund code<' + code + '> already exists, skipping...')
            return 'CODE_EXIST'
        entity.code = code
        entity.name = item['name']['text']
        isinCode = item['extent']['isincode']
        # special condition, sometimes it has two different code but same isin code
        queryEntity = FundFacade.queryByIsinCode(isinCode)
        if queryEntity:
            print('[WARN] fund isinCode<' + isinCode + '> already exists, skipping...')
            return 'ISIN_CODE_EXIST'
        entity.isin_code = isinCode
        dateStr = item['hit']['interval']['beginning']
        offeringDate = datetime.datetime(int(dateStr[0:4]), int(dateStr[5:7]), int(dateStr[8:9]))
        entity.offering_date = offeringDate
        entity.currency = item['extent']['currency']
        print('[INFO] fetching fund<{code}>\'s symbol...'.format(code = code))
        entity.symbol = yf.Ticker(entity.isin_code).ticker
        FundFacade.insert(entity)
        return 'SUCCESS'
    else:
        return 'NO_DATA'

def fetchFundRecords(code: str):
    try:
        fundEntity = FundFacade.queryByCode(code)
        if fundEntity:
            targetDate = fundEntity.offering_date
            records = FundRecordFacade.queryByCode(code)
            if len(records) > 0:
                targetDate = records[-1].date
            requestData = {
                'data': {
                    'fundId': code,
                    'period': 'Customize',
                    'startTime': AppUtil.convertDateToStr(targetDate),
                    'endTime': AppUtil.convertDateToStr(datetime.datetime.now())
                }
            }
            response = requests.post(CodeConstant.FUND_RICH_RECORDS_URL, json = requestData, headers = CodeConstant.FUND_RICH_REQUEST_HEADER)
            richData = response.json()
            response.close()
            for item in richData['data']['tableRow']['priceHistory']:
                date = datetime.datetime(int(item['date'][0:4]), int(item['date'][5:7]), int(item['date'][8:10]))
                entity = FundRecord()
                queryEntity = FundRecordFacade.queryByCodeAndDate(code, date)
                if queryEntity:
                    entity.id = queryEntity.id
                entity.code = code
                entity.date = date
                entity.price = float(item['price'])
                if entity.id:
                    FundRecordFacade.update(entity)
                else:
                    FundRecordFacade.insert(entity)
            return 'SUCCESS'
        else:
            print('[INFO] find no fund with code<{code}>'.format(code = code))
            return 'NO_DATA'
    except Exception as e:
        return str(e)
