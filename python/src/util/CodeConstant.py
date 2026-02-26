EXCHANGE_RATE_RECORD_URL = 'https://rate.bot.com.tw/xrt/flcsv/0/{year}-{month}/{currency}'

FUND_NAME_URL = 'https://apis.fundrich.com.tw/FRSDataCenter/GetFundDetail'
FUND_INFO_URL = 'https://apis.fundrich.com.tw/FRSDataCenter/GetFundBasicInfo'
FUND_RICH_RECORDS_URL = 'https://apis.fundrich.com.tw/FRSDataCenter/GetFundChart'
FUND_RICH_REQUEST_HEADER = {
    'Content-Type': 'application/json',
    'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36'
}

STOCK_LIST_URL = 'https://isin.twse.com.tw/isin/class_main.jsp?owncode={owncode}&stockname=&isincode=&market=&issuetype=&industry_code=&Page=1&chklike=Y'
STOCK_YAHOO_URL = 'https://query1.finance.yahoo.com/v8/finance/chart/{symbol}?period1={start}&period2={end}&interval=1d'
STOCK_TWSE_RECORD_URL = 'https://www.twse.com.tw/exchangeReport/STOCK_DAY?response=json&date={date}&stockNo={code}' # date format yyyymmdd
STOCK_TPEX_RECORD_URL = 'https://www.tpex.org.tw/web/stock/aftertrading/daily_trading_info/st43_result.php?d={date}&stkno={code}' # date format yyy/mm/dd
