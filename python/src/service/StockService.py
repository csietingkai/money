import datetime
import json
import requests
import pandas
import time
import re
import yfinance as yf
from typing import Optional

from entity.Stock import Stock
from entity.StockRecord import StockRecord
from facade import StockFacade, StockRecordFacade
from util import AppUtil, CodeConstant

MarketTypes = {
    '上市': 'LSE',
	'上櫃': 'OTC',
	'興櫃': 'LES'
}

def fetchStock(targetCode):
    try:
        url = CodeConstant.STOCK_LIST_URL.format(owncode = targetCode)
        data = pandas.read_html(url, encoding='big5')[0]
        length = len(data[0])
        print('[INFO] fetched {length} data, processing...'.format(length = length))
        for row in range(length):
            # skip csv title in first row
            if row == 0:
                continue

            # rowNo = data[0][row]
            isin = data[1][row]
            code = data[2][row]
            name = data[3][row]
            marketType = data[4][row]
            # stockType = data[5][row]
            industryType = data[6][row]
            createDt = data[7][row]
            cfiCode = data[8][row]
            desc = data[9][row]

            if targetCode != code:
                continue
            # skip if already exist
            entity = Stock()
            queryEntity = StockFacade.queryByCode(code)
            if queryEntity:
                print('[DEBUG] stock code<{code}> already exists.'.format(code = code))
                entity.id = queryEntity.id
            entity.code = code
            entity.name = name
            entity.isin_code = isin
            entity.currency = 'TWD'
            year = createDt.split('/')[0]
            month = createDt.split('/')[1]
            day = createDt.split('/')[2]
            entity.offering_date = datetime.datetime(int(year), int(month), int(day))
            entity.market_type = AppUtil.toString(MarketTypes[marketType], None)
            entity.industry_type = AppUtil.toString(industryType, None)
            entity.cfi_code = AppUtil.toString(cfiCode, None)
            entity.description = AppUtil.toString(desc, None)
            print('[INFO] fetching stock<{code}>\'s symbol...'.format(code = code))
            entity.symbol = yf.Ticker(entity.isin_code).ticker
            # entity has id means update
            if entity.id:
                StockFacade.update(entity)
            else:
                StockFacade.insert(entity)
        return 'SUCCESS'
    except Exception as e:
        return str(e)

def fetchStockRecord(code):
    stock = StockFacade.queryByCode(code)
    if not stock:
        print('[INFO] find no code<{code}> int database'.format(code = code))
        return 'NO_SUCH_CODE'

    startDate = stock.offering_date
    endDate = datetime.datetime.now()

    records = StockRecordFacade.queryByCode(code)
    if len(records) > 0:
        record = records[-1]
        startDate = record.deal_date
        startDate += datetime.timedelta(days = 1)

    if stock.symbol:
        return fetchStockRecordFromYahoo(stock.code, stock.symbol, int(datetime.datetime.timestamp(startDate)), int(datetime.datetime.timestamp(endDate)))
    else:
        fetchStockRecordFromTwse(code, int(datetime.datetime.timestamp(startDate)), int(datetime.datetime.timestamp(endDate)))
        fetchStockRecordFromTpex(code, int(datetime.datetime.timestamp(startDate)), int(datetime.datetime.timestamp(endDate)))
        return 'SUCCESS'

def fetchStockRecordFromYahoo(code: str, symbol: str, start: int, end: int):
    try:
        print('[INFO] fetching stocks<{symbol}>\'s records from yahoo...'.format(symbol = symbol))

        response = requests.get(CodeConstant.STOCK_YAHOO_URL.format(symbol = symbol, start = start, end = end), headers={'User-Agent': 'Mozilla/5.0'})
        print('[INFO] fetched response status_code: {statusCode}'.format(statusCode = response.status_code))
        response = response.json()
        chart = response['chart']

        if chart['error']:
            return str(chart['error'])

        dateLst = chart['result'][0]['timestamp']
        openLst = chart['result'][0]['indicators']['quote'][0]['open']
        closeLst = chart['result'][0]['indicators']['quote'][0]['close']
        highLst = chart['result'][0]['indicators']['quote'][0]['high']
        lowLst = chart['result'][0]['indicators']['quote'][0]['low']
        volumeLst = chart['result'][0]['indicators']['quote'][0]['volume']

        size = len(dateLst)
        for i in range(size):
            dealDate = datetime.datetime.fromtimestamp(dateLst[i]).replace(hour=0, minute=0)
            openPrice = handleYahooPrice(openLst[i])
            highPrice = handleYahooPrice(highLst[i])
            lowPrice = handleYahooPrice(lowLst[i])
            closePrice = handleYahooPrice(closeLst[i])
            dealShare = handleYahooPrice(volumeLst[i])
            if openPrice == '0.00' or highPrice == '0.00' or lowPrice == '0.00' or closePrice == '0.00':
                print('[WARN]: {date} has openPrice<{openPrice}> highPrice<{highPrice}> lowPrice<{lowPrice}> closePrice<{closePrice}>'.format(date = dealDate, openPrice = openPrice, highPrice = highPrice, lowPrice = lowPrice, closePrice = closePrice))
            else:
                entity = StockRecord()
                queryStockRecord = StockRecordFacade.queryByCodeAndDealDate(code, dealDate)
                if queryStockRecord:
                    entity.id = queryStockRecord.id
                entity.code = code
                entity.deal_date = dealDate
                entity.deal_share = dealShare
                entity.open_price = openPrice
                entity.high_price = highPrice
                entity.low_price = lowPrice
                entity.close_price = closePrice
                # entity has id means update
                if entity.id:
                    StockRecordFacade.update(entity)
                else:
                    StockRecordFacade.insert(entity)
        return 'SUCCESS'
    except Exception as e:
        e.with_traceback()
        print(e)
        return str(e)

def fetchStockRecordFromTwse(code: str, start: int, end: Optional[int]):
    try:
        print('[INFO] fetching stocks<{code}>\'s records with start = <{start}> and end = <{end}> from TWSE...'.format(code = code, start = start, end = end))
        isSingleDay = False
        if not end:
            isSingleDay = True
            end = start

        startDate = datetime.datetime.fromtimestamp(start)
        startYear, startMonth, startDay = startDate.year, startDate.month, startDate.day
        endDate = datetime.datetime.fromtimestamp(end)
        endYear, endMonth, endDay = endDate.year, endDate.month, endDate.day
        currentYear, currentMonth = startYear, startMonth
        currentClose = 0.0
        dataCnt = 0
        while currentYear * 12 + currentMonth <= endYear * 12 + endMonth:
            print('[INFO] fetching stock code<{code}> from TWSE with {year}/{month} data'.format(code = code, year = currentYear, month = currentMonth))
            url = CodeConstant.STOCK_TWSE_RECORD_URL.format(code = code, date = AppUtil.toDateStr(currentYear, currentMonth, 1))
            response = requests.get(url)
            jsonResponse = response.json()
            response.close()
            if 'data' in jsonResponse and isinstance(jsonResponse['data'], list):
                data = jsonResponse['data']
                for item in data:
                    if (not isSingleDay) or (AppUtil.toDateStr(currentYear - 1911, currentMonth, startDay, '/') == item[0]):
                        dealDate = datetime.datetime(currentYear, currentMonth, int(item[0][7:9]))
                        if dealDate < startDate:
                            continue
                        elif dealDate > endDate:
                            break

                        entity = StockRecord()
                        queryStockRecord = StockRecordFacade.queryByCodeAndDealDate(code, dealDate)
                        if queryStockRecord:
                            entity = queryStockRecord
                        entity.code = code
                        entity.deal_date = dealDate
                        entity.deal_share = AppUtil.toNumber(item[1])
                        entity.open_price = AppUtil.toNumber(item[3], 4, currentClose)
                        entity.high_price = AppUtil.toNumber(item[4], 4, currentClose)
                        entity.low_price = AppUtil.toNumber(item[5], 4, currentClose)
                        entity.close_price = AppUtil.toNumber(item[6], 4, currentClose)
                        currentClose = entity.close_price
                        # entity has id means update
                        if entity.id:
                            StockRecordFacade.update(entity)
                            dataCnt += 1
                        else:
                            StockRecordFacade.insert(entity)
                            dataCnt += 1
            currentMonth += 1
            if currentMonth > 12:
                currentMonth = 1
                currentYear += 1
            time.sleep(3)
        return 'SUCCESS', dataCnt
    except Exception as e:
        return str(e)

def fetchStockRecordFromTpex(code: str, start: int, end: Optional[int]):
    try:
        print('[INFO] fetching stocks<{code}>\'s records with start = <{start}> and end = <{end}> from TPEX...'.format(code = code, start = start, end = end))
        isSingleDay = False
        if not end:
            isSingleDay = True
            end = start

        startDate = datetime.datetime.fromtimestamp(start)
        startYear, startMonth, startDay = startDate.year, startDate.month, startDate.day
        endDate = datetime.datetime.fromtimestamp(end)
        endYear, endMonth, endDay = endDate.year, endDate.month, endDate.day
        currentYear, currentMonth = startYear, startMonth
        currentClose = 0.0
        dataCnt = 0
        while currentYear * 12 + currentMonth <= endYear * 12 + endMonth:
            print('[INFO] fetching stock code<{code}> from TPEX with {year}/{month} data'.format(code = code, year = currentYear, month = currentMonth))
            url = CodeConstant.STOCK_TPEX_RECORD_URL.format(code = code, date = AppUtil.toDateStr(currentYear - 1911, currentMonth, 1, '/'))
            response = requests.get(url)
            jsonResponse = response.json()
            response.close()
            if 'aaData' in jsonResponse and isinstance(jsonResponse['aaData'], list):
                data = jsonResponse['aaData']
                for item in data:
                    if (not isSingleDay) or (AppUtil.toDateStr(currentYear - 1911, currentMonth, startDay, '/') == item[0]):
                        dealDate = datetime.datetime(currentYear, currentMonth, int(item[0][7:9]))
                        if dealDate < startDate:
                            continue
                        elif dealDate > endDate:
                            break

                        entity = StockRecord()
                        queryStockRecord = StockRecordFacade.queryByCodeAndDealDate(code, dealDate)
                        if queryStockRecord:
                            entity = queryStockRecord
                        entity.code = code
                        entity.deal_date = dealDate
                        entity.deal_share = AppUtil.toNumber(item[1])
                        entity.open_price = AppUtil.toNumber(item[3], currentClose)
                        entity.high_price = AppUtil.toNumber(item[4], currentClose)
                        entity.low_price = AppUtil.toNumber(item[5], currentClose)
                        entity.close_price = AppUtil.toNumber(item[6], currentClose)
                        currentClose = entity.close_price
                        # entity has id means update
                        if entity.id:
                            StockRecordFacade.update(entity)
                            dataCnt += 1
                        else:
                            StockRecordFacade.insert(entity)
                            dataCnt += 1
            currentMonth += 1
            if currentMonth > 12:
                currentMonth = 1
                currentYear += 1
            time.sleep(3)
        return 'SUCCESS', dataCnt
    except Exception as e:
        return str(e)

# 是否為權證
def isWarrant(code: str) -> bool:
    return re.search("[0-9]{6}", code) or re.search("[0-9]{5}[PFQCBXY]", code)

def handleYahooPrice(price: float) -> float:
    if price is None:
        price = 0
    step, percision = priceStep(price)
    priceStr = ("{:." + str(percision) + "f}").format(price)
    return AppUtil.toNumber(priceStr, percision)

# 股價升降級距
def priceStep(price: float):
    step = 0.01
    percision = 2
    if price >= 1000:
        step = 5
        percision = 0
    elif price >= 500:
        step = 1
        percision = 0
    elif price >= 100:
        step = 0.5
        percision = 1
    elif price >= 50:
        step = 0.1
        percision = 1
    elif price >= 10:
        step = 0.05
        percision = 2

    return step, percision
