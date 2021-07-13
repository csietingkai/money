from flask import Flask
from flask import request
from flask import jsonify
import twder

from service import ExchangeRateService
from service import StockService

app = Flask(__name__)

@app.route('/fetch/exchangeRate')
def fetchExchangeRate():
    return ExchangeRateService.fetchExchangeRates()

@app.route('/fetch/stocks')
def fetchStocks():
    marketType = request.args.get('marketType')
    return StockService.fetchStocks(marketType)

@app.route('/fetch/stock')
def fetchStock():
    code = request.args.get('code')
    return StockService.fetchStock(code)

@app.route('/fetch/allStockRecord')
def fetchAllStockRecord():
    code = request.args.get('code')
    start = int(request.args.get('start'))
    end = int(request.args.get('end'))
    return StockService.fetchAllStockRecord(code, start, end)

if __name__ == '__main__':
    app.run(host='0.0.0.0', debug = True)
