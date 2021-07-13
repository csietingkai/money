import requests
import pandas
import math
import json
import csv
import time

MarketTypes = {
    'LSE': '2',
	'OTC': '4',
	'LES': '5'
}

def fetchStocks(marketType):
    url='https://isin.twse.com.tw/isin/C_public.jsp?strMode=' + MarketTypes[marketType]
    res = requests.get(url)
    data = pandas.read_html(res.text)[0]
    returnData = {}
    length = len(data[0])
    for row in range(length):
        if row == 0 or len(data[0][row].split()) != 2:
            continue
        code = data[0][row].split()[0]
        name = data[0][row].split()[1]
        if len(code) < 6:
            returnData[code] = {}
            returnData[code]['name'] = name
            returnData[code]['isinCode'] = data[1][row]
            returnData[code]['offeringDate'] = data[2][row]
            returnData[code]['marketType'] = data[3][row]
            returnData[code]['industryType'] = toEmptyString(data[4][row])
            returnData[code]['cfiCode'] = toEmptyString(data[5][row])
            returnData[code]['description'] = toEmptyString(data[6][row])
    return returnData

def fetchStock(code):
    for idx, marketType in enumerate(['LSE', 'OTC', 'LES']):
        datas = fetchStocks(marketType)
        if (datas[code]):
            datas[code]['marketType'] = marketType
            return datas[code]
    return {}

def fetchAllStockRecord(code, start, end):
    returnData = {}
    urlFormat = 'https://query1.finance.yahoo.com/v7/finance/download/{code}?period1={start}&period2={end}&interval=1d&events=history&includeAdjustedClose=true'
    url = urlFormat.format(code = code, start = start, end = end)
    with requests.Session() as s:
        noDataDates = []
        try:
            download = s.get(url)

            decoded_content = download.content.decode('utf-8')

            cr = csv.reader(decoded_content.splitlines(), delimiter=',')
            my_list = list(cr)
            firstRow = True
            for row in my_list:
                if firstRow:
                    firstRow = False
                    continue
                dealDate = row[0].replace('-', '/')
                openPrice = toNumber(row[1])
                highPrice = toNumber(row[2])
                lowPrice = toNumber(row[3])
                closePrice = toNumber(row[4])
                dealShare = toNumber(row[6])
                if openPrice == '0.00' or highPrice == '0.00' or lowPrice == '0.00' or closePrice == '0.00':
                    print('{date} has openPrice: {openPrice}, highPrice: {highPrice}, lowPrice: {lowPrice}, closePrice: {closePrice}, fetch data from TWSE'.format(date=dealDate, openPrice=openPrice, highPrice=highPrice, lowPrice=lowPrice, closePrice=closePrice))
                    noDataDates.append(dealDate)
                else:
                    returnData[dealDate] = [openPrice, highPrice, lowPrice, closePrice, dealShare]
            for dealDate in noDataDates:
                print('fetching {dealDate} date from TWSE'.format(dealDate=dealDate))
                data = fetchSingleStockRecord(code.split('.')[0], dealDate.replace('/', ''), 'TWSE')
                if len(data) > 0:
                    returnData[dealDate] = data
                else:
                    data = fetchSingleStockRecord(code.split('.')[0], dealDate, 'TPEX')
                time.sleep(3)
        except Exception as e:
            print(str(e))
        s.close()
    return returnData

def fetchSingleStockRecord(code, date, source):
    print(date)
    urlFormat = ''
    if source == 'TWSE':
        urlFormat = 'https://www.twse.com.tw/exchangeReport/STOCK_DAY?response=json&date={date}&stockNo={code}'
    elif source == 'TPEX':
        urlFormat = 'https://www.tpex.org.tw/web/stock/aftertrading/daily_trading_info/st43_result.php?d={date}&stkno={code}'
    else:
        return []
    url = urlFormat.format(code = code, date = date)
    response = requests.get(url)
    jsonResponse = response.json()
    response.close()
    if source == 'TWSE':
        if 'data' in jsonResponse and isinstance(jsonResponse['data'], list):
            data = jsonResponse['data']
            for item in data:
                year = int(item[0].split('/')[0]) + 1911
                jsonDate = str(year) + item[0].split('/')[1] + item[0].split('/')[2]
                if jsonDate == date:
                    openPrice = toNumber(item[3])
                    highPrice = toNumber(item[4])
                    lowPrice = toNumber(item[5])
                    closePrice = toNumber(item[6])
                    dealShare = toNumber(item[1])
                    if openPrice == '0.00' and highPrice == '0.00' and lowPrice == '0.00' and closePrice == '0.00':
                        return [ openPrice, highPrice, lowPrice, closePrice, dealShare ]
    elif source == 'TPEX':
        if 'aaData' in jsonResponse and isinstance(jsonResponse['data'], list):
            data = jsonResponse['aaData']
            for item in data:
                year = int(item[0].split('/')[0]) + 1911
                jsonDate = str(year) + item[0].split('/')[1] + item[0].split('/')[2]
                if jsonDate == date.replace('/', ''):
                    openPrice = toNumber(item[3])
                    highPrice = toNumber(item[4])
                    lowPrice = toNumber(item[5])
                    closePrice = toNumber(item[6])
                    dealShare = toNumber(item[1])
                    if openPrice == '0.00' and highPrice == '0.00' and lowPrice == '0.00' and closePrice == '0.00':
                        return [ openPrice, highPrice, lowPrice, closePrice, dealShare ]
    return []

def toEmptyString(s):
    if (not isinstance(s, str)) and math.isnan(s):
        s = ''
    return s

def toNumber(s):
    if s == 'null':
        s = '0'
    s = s.replace(',', '')
    return format(float(s), '.2f')
