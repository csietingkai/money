YAHOO_REQUEST_HEADER = {
    'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.107 Safari/537.36'
}
YAHOO_ISIN_TO_SYMBOL_URL = 'https://query2.finance.yahoo.com/v1/finance/search?q={isinCode}&quotesCount=1&newsCount=0'

EXCHANGE_RATE_RECORD_URL = 'https://rate.bot.com.tw/xrt/flcsv/0/{year}-{month}/{currency}'

FUND_LIST_URL = 'https://apis.fundrich.com.tw/FrsWebApi/Common/ThemeFund/FundsDataInfo'
FUND_RICH_RECORDS_URL = 'https://apis.fundrich.com.tw/FRSDataCenter/GetFundChart'
FUND_RICH_REQUEST_HEADER = {
    'Content-Type': 'application/json',
    'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36'
}

STOCK_LIST_URL = 'https://isin.twse.com.tw/isin/C_public.jsp?strMode={mode}'
STOCK_RECORDS_URL = 'https://query1.finance.yahoo.com/v8/finance/chart/{symbol}?period1={start}&period2={end}&interval=1d&includePrePost=true&events=div%7Csplit%7Cearn&useYfid=true&lang=en-US&region=US'
STOCK_TWSE_RECORD_URL = 'https://www.twse.com.tw/exchangeReport/STOCK_DAY?response=json&date={date}&stockNo={code}' # date format yyyymmdd
STOCK_TPEX_RECORD_URL = 'https://www.tpex.org.tw/web/stock/aftertrading/daily_trading_info/st43_result.php?d={date}&stkno={code}' # date format yyy/mm/dd
