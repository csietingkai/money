import datetime
import requests
import pandas
import csv
import time
import re
from typing import Optional

from entity.Stock import Stock
from entity.StockRecord import StockRecord
from facade import StockFacade, StockRecordFacade
from util import AppUtil, CodeConstant

MarketTypes = {
    'LSE': '2',
	'OTC': '4',
	'LES': '5'
}

def fetchStocks(marketType):
    try:
        print('[INFO] fetching stocks with marketType<{marketType}> data...'.format(marketType = marketType))
        url = CodeConstant.STOCK_LIST_URL.format(mode = MarketTypes[marketType])
        res = requests.get(url)
        data = pandas.read_html(res.text)[0]
        length = len(data[0])
        print('[INFO] fetched {length} data, processing...'.format(length = length))
        for row in range(length):
            # skip csv title in first row
            if row == 0 or len(data[0][row].split()) != 2:
                continue
            # skip if already exist
            code = data[0][row].split()[0]
            if isWarrant(code):
                print('[DEBUG] stock code<{code}> is warrant, skipping...'.format(code = code))
                continue
            queryEntity = StockFacade.queryByCode(code)
            if queryEntity:
                print('[DEBUG] stock code<{code}> already exists, skipping...'.format(code = code))
                continue
            name = data[0][row].split()[1]
            entity = Stock()
            entity.code = code
            entity.name = name
            entity.isin_code = data[1][row]
            entity.currency = 'TWD'
            year = data[2][row].split('/')[0]
            month = data[2][row].split('/')[1]
            day = data[2][row].split('/')[2]
            entity.offering_date = datetime.datetime(int(year), int(month), int(day))
            entity.market_type = marketType
            entity.industry_type = AppUtil.toString(data[4][row], None)
            entity.cfi_code = AppUtil.toString(data[5][row], None)
            entity.description = AppUtil.toString(data[6][row], None)
            print('[INFO] fetching stock<{code}>\'s symbol...'.format(code = code))
            response = requests.get(CodeConstant.YAHOO_ISIN_TO_SYMBOL_URL.format(isinCode = entity.isin_code), headers = CodeConstant.YAHOO_REQUEST_HEADER)
            response = response.json()
            if len(response['quotes']) > 0:
                entity.symbol = response['quotes'][0]['symbol']
            StockFacade.insert(entity)
            time.sleep(3)
        return 'SUCCESS'
    except Exception as e:
        return str(e)

def fetchStock(targetCode):
    try:
        for idx, marketType in enumerate(['LES', 'OTC', 'LSE']):
            print('[INFO] fetching stocks with marketType<{marketType}> data...'.format(marketType = marketType))
            url = CodeConstant.STOCK_LIST_URL.format(mode = MarketTypes[marketType])
            res = requests.get(url)
            data = pandas.read_html(res.text)[0]
            length = len(data[0])
            print('[INFO] fetched {length} data, processing...'.format(length = length))
            for row in range(length):
                # skip csv title in first row
                if row == 0 or len(data[0][row].split()) != 2:
                    continue

                code = data[0][row].split()[0]
                if targetCode != code:
                    continue
                # skip if already exist
                entity = Stock()
                queryEntity = StockFacade.queryByCode(code)
                if queryEntity:
                    print('[DEBUG] stock code<{code}> already exists, skipping...'.format(code = code))
                    entity.id = queryEntity.id
                name = data[0][row].split()[1]
                entity.code = code
                entity.name = name
                entity.isin_code = data[1][row]
                year = data[2][row].split('/')[0]
                month = data[2][row].split('/')[1]
                day = data[2][row].split('/')[2]
                entity.offering_date = datetime.datetime(int(year), int(month), int(day))
                entity.market_type = marketType
                entity.industry_type = AppUtil.toString(data[4][row], None)
                entity.cfi_code = AppUtil.toString(data[5][row], None)
                entity.description = AppUtil.toString(data[6][row], None)
                print('[INFO] fetching stock<{code}>\'s symbol...'.format(code = code))
                response = requests.get(CodeConstant.YAHOO_ISIN_TO_SYMBOL_URL.format(isinCode = entity.isin_code), headers = CodeConstant.YAHOO_REQUEST_HEADER)
                response = response.json()
                if len(response['quotes']) > 0:
                    entity.symbol = response['quotes'][0]['symbol']
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
        return fetchStockRecordFromYahoo(stock.symbol, int(datetime.datetime.timestamp(startDate)), int(datetime.datetime.timestamp(endDate)))
    else:
        fetchStockRecordFromTwse(code, int(datetime.datetime.timestamp(startDate)), int(datetime.datetime.timestamp(endDate)))
        fetchStockRecordFromTpex(code, int(datetime.datetime.timestamp(startDate)), int(datetime.datetime.timestamp(endDate)))
        return 'SUCCESS'

def fetchStockRecordFromYahoo(symbol: str, start: int, end: int):
    try:
        print('[INFO] fetching stocks<{symbol}>\'s records from yahoo...'.format(symbol = symbol))
        code = StockFacade.queryCodeBySymbol(symbol)
        url = CodeConstant.STOCK_RECORDS_URL.format(symbol = symbol, start = start, end = end)
        with requests.Session() as s:
            noDataDates = []
            try:
                download = s.get(url, headers = CodeConstant.YAHOO_REQUEST_HEADER)

                decoded_content = download.content.decode('utf-8')

                cr = csv.reader(decoded_content.splitlines(), delimiter = ',')
                my_list = list(cr)
                firstRow = True
                for row in my_list:
                    if firstRow:
                        firstRow = False
                        continue
                    dealDate = datetime.datetime(int(row[0][0:4]), int(row[0][5:7]), int(row[0][8:10]))
                    openPrice = AppUtil.toNumber(row[1])
                    highPrice = AppUtil.toNumber(row[2])
                    lowPrice = AppUtil.toNumber(row[3])
                    closePrice = AppUtil.toNumber(row[4])
                    dealShare = AppUtil.toNumber(row[6])
                    if openPrice == '0.00' or highPrice == '0.00' or lowPrice == '0.00' or closePrice == '0.00':
                        print('[WARN]: {date} has openPrice<{openPrice}> highPrice<{highPrice}> lowPrice<{lowPrice}> closePrice<{closePrice}>'.format(date = dealDate, openPrice = openPrice, highPrice = highPrice, lowPrice = lowPrice, closePrice = closePrice))
                        noDataDates.append(dealDate)
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
                for dealDate in noDataDates:
                    result, dataCnt = fetchStockRecordFromTwse(code, datetime.datetime.timestamp(dealDate))
                    if result != 'SUCCESS' or dataCnt == 0:
                        fetchStockRecordFromTpex(code, datetime.datetime.timestamp(dealDate))
                    time.sleep(3)
            except Exception as e:
                print(str(e))
            s.close()
        return 'SUCCESS'
    except Exception as e:
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
