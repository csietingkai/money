from entity.Fund import Fund
from dao import FundDao

def queryByCode(code: str):
    entity = FundDao.findByCode(code)
    if not entity:
        print('[DEBUG] find no code<{code}> in database'.format(code = code))
    return entity

def queryByIsinCode(isinCode: str):
    entity = FundDao.findByIsinCode(isinCode)
    if not entity:
        print('[DEBUG] find no isinCode<{isinCode}> in database'.format(isinCode = isinCode))
    return entity

def queryCodeBySymbol(symbol: str):
    if symbol:
        queryStock = FundDao.findBySymbol(symbol)
        if queryStock:
            return queryStock.code
        else:
            print('[DEBUG] symbol<{symbol}> find no fund in database'.format(symbol = symbol))
    else:
        print('[DEBUG] symbol<{symbol}> is not valid'.format(symbol = symbol))
    return None

def insert(entity: Fund):
    if isinstance(entity, Fund) and checkInsertColumn(entity):
        FundDao.insert(entity)
        return 1
    else:
        print('[DEBUG] entity<{entity}> is not valid Fund'.format(entity = entity))
        return 0

def checkInsertColumn(entity: Fund) -> bool:
    return entity and entity.code and entity.name and entity.isin_code and entity.offering_date and entity.currency

def update(entity: Fund):
    if isinstance(entity, Fund) and checkUpdateColumn(entity):
        FundDao.update(entity)
        return 1
    else:
        print('[DEBUG] entity<{entity}> is not valid Fund'.format(entity = entity))
        return 0

def checkUpdateColumn(entity: Fund) -> bool:
    return checkInsertColumn(entity) and entity.id
