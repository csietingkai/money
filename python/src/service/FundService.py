import datetime
import requests
import time

from entity.Fund import Fund
from entity.FundRecord import FundRecord
from facade import FundFacade, FundRecordFacade
from util import AppUtil, CodeConstant

def fetchFunds():
    hasData = True
    page = 1
    while hasData:
        print('[INFO] fetching page ' + str(page) + ' data...')
        response = requests.post(CodeConstant.FUND_LIST_URL, json={'page': str(page), 'order': 'isincode-asc'})
        response = response.json()
        items = response['items']
        skipCnt = 0
        for item in items:
            entity = Fund()
            # skip if already exist
            code = item['fundId']
            queryEntity = FundFacade.queryByCode(code)
            if queryEntity:
                print('[INFO] fund code<' + code + '> already exists, skipping...')
                skipCnt += 1
                continue
            entity.code = code
            entity.name = item['name']['text']
            isinCode = item['extent']['isincode']
            # special condition, sometimes it has two different code but same isin code
            queryEntity = FundFacade.queryByIsinCode(isinCode)
            if queryEntity:
                print('[WARN] fund isinCode<' + isinCode + '> already exists, skipping...')
                skipCnt += 1
                continue
            entity.isin_code = isinCode
            dateStr = item['hit']['interval']['beginning']
            offeringDate = datetime.datetime(int(dateStr[0:4]), int(dateStr[5:7]), int(dateStr[8:9]))
            entity.offering_date = offeringDate
            entity.currency = item['extent']['currency']
            response = requests.get(CodeConstant.YAHOO_ISIN_TO_SYMBOL_URL.format(isinCode = item['extent']['isincode']), headers = CodeConstant.YAHOO_REQUEST_HEADER)
            response = response.json()
            if len(response['quotes']) > 0:
                entity.symbol = response['quotes'][0]['symbol']
            FundFacade.insert(entity)
            time.sleep(3)
        if len(items) == 10:
            page += 1
        else:
            hasData = False
        if skipCnt == 10:
            time.sleep(3)
    return 'SUCCESS'

def fetchFund(targetCode):
    response = requests.post(CodeConstant.FUND_LIST_URL, json={'order': 'isincode-asc', 'keyword': targetCode})
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
        response = requests.get(CodeConstant.YAHOO_ISIN_TO_SYMBOL_URL.format(isinCode = item['extent']['isincode']), headers = CodeConstant.YAHOO_REQUEST_HEADER)
        response = response.json()
        if len(response['quotes']) > 0:
            entity.symbol = response['quotes'][0]['symbol']
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
            url = CodeConstant.FUND_RICH_RECORDS_URL.format(code = code)
            response = requests.get(url)
            richData = response.json()
            response.close()
            if isinstance(richData, list):
                for item in richData:
                    date = datetime.datetime(int(item['TransDate'][0:4]), int(item['TransDate'][4:6]), int(item['TransDate'][6:8]))
                    if targetDate > date:
                        continue
                    entity = FundRecord()
                    queryEntity = FundRecordFacade.queryByCodeAndDate(code, date)
                    if queryEntity:
                        entity.id = queryEntity.id
                    entity.code = code
                    entity.date = date
                    entity.price = item['Price']
                    if entity.id:
                        FundRecordFacade.update(entity)
                    else:
                        FundRecordFacade.insert(entity)
                return 'SUCCESS'
            return richData['Message']
        else:
            print('[INFO] find no fund with code<{code}>'.format(code = code))
            return 'NO_DATA'
    except Exception as e:
        return str(e)
