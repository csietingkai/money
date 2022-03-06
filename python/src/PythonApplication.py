from flask import Flask
from flask import request

from entity import BaseEntity
from service import FundService, ExchangeRateService, PredictService, StockService
from util import Config

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://%(username)s:%(password)s@%(host)s:%(port)s/%(db)s' % Config.DATASOURCE
# app.config['SQLALCHEMY_ECHO'] = True

BaseEntity.db.init_app(app)

@app.route('/fetch/exchangeRates')
def fetchExchangeRate():
    return ExchangeRateService.fetchExchangeRates()

@app.route('/fetch/exchangeRateRecords')
def fetchAllExchangeRateRecord():
    currency = request.args.get('currency')
    return ExchangeRateService.fetchAllExchangeRateRecord(currency)

@app.route('/fetch/stocks')
def fetchStocks():
    marketType = request.args.get('marketType')
    return StockService.fetchStocks(marketType)

@app.route('/fetch/stock')
def fetchStock():
    code = request.args.get('code')
    return StockService.fetchStock(code)

@app.route('/fetch/stockRecords')
def fetchStockRecord():
    code = request.args.get('code')
    return StockService.fetchStockRecord(code)

@app.route('/fetch/funds')
def fetchFunds():
    return FundService.fetchFunds()

@app.route('/fetch/fund')
def fetchFund():
    code = request.args.get('code')
    return FundService.fetchFund(code)

@app.route('/fetch/fundRecords')
def fetchFundRecord():
    code = request.args.get('code')
    return FundService.fetchFundRecords(code)

@app.route('/predict/stock')
def predictStock():
    code = request.args.get('code')
    days = int(request.args.get('days'))
    return PredictService.predictStock(code, days)

@app.route('/predict/fund')
def predictFund():
    code = request.args.get('code')
    days = int(request.args.get('days'))
    return PredictService.predictFund(code, days)

if __name__ == '__main__':
    app.run(host='0.0.0.0', debug = True)
