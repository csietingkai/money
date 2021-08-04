from entity.Stock import Stock
from dao import StockDao

def queryByCode(code: str):
    entity = StockDao.findByCode(code)
    if not entity:
        print('[DEBUG] find no code<{code}> in database'.format(code = code))
    return entity

def queryCodeBySymbol(symbol: str):
    if symbol:
        queryStock = StockDao.findBySymbol(symbol)
        if queryStock:
            return queryStock.code
        else:
            print('[DEBUG] symbol<{symbol}> find no stock in database'.format(symbol = symbol))
    else:
        print('[DEBUG] symbol<{symbol}> is not valid'.format(symbol = symbol))
    return ''

def insert(entity: Stock):
    if isinstance(entity, Stock) and checkInsertColumn(entity):
        StockDao.insert(entity)
    else:
        print('[DEBUG] entity<{entity}> is not valid Stock'.format(entity = entity))

def checkInsertColumn(entity: Stock) -> bool:
    return entity and entity.code and entity.isin_code and entity.currency and entity.offering_date and entity.market_type and entity.cfi_code

def update(entity: Stock):
    if isinstance(entity, Stock) and checkUpdateColumn(entity):
        StockDao.update(entity)
    else:
        print('[DEBUG] entity<{entity}> is not valid Stock'.format(entity = entity))

def checkUpdateColumn(entity: Stock) -> bool:
    return checkInsertColumn(entity) and entity.id
