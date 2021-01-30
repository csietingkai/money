import requests
import pandas
import math
import json
import csv

MarketTypes = {
    'LSE': '2',
	'OTC': '4',
	'LES': '5'
}

def fetchStock(marketType):
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

def fetchAllStockRecord(code, start, end):
    returnData = {}
    urlFormat = 'https://query1.finance.yahoo.com/v7/finance/download/{code}?period1={start}&period2={end}&interval=1d&events=history&includeAdjustedClose=true'
    url = urlFormat.format(code = code, start = start, end = end)
    with requests.Session() as s:
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
                returnData[dealDate] = [
                    toNumber(row[1]), # openPrice
                    toNumber(row[2]), # highPrice
                    toNumber(row[3]), # lowPrice
                    toNumber(row[4]), # closePrice
                    toNumber(row[6])  # dealShare
                ]
        except Exception as e:
            print(str(e))
    return returnData

def toEmptyString(s):
    if (not isinstance(s, str)) and math.isnan(s):
        s = ''
    return s

def toNumber(s):
    if s == 'null':
        s = '0'
    s = s.replace(',', '')
    return format(float(s), '.2f')
