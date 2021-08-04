from entity.ExchangeRate import ExchangeRate
from dao import ExchangeRateDao

def queryByCurrency(currency: str):
    entity = ExchangeRateDao.findByCurrency(currency)
    if not entity:
        print('[DEBUG] currency<{currency}> cannot find in database'.format(currency = currency))
    return entity

def insert(entity: ExchangeRate):
    if isinstance(entity, ExchangeRate) and checkInsertColumn(entity):
        ExchangeRateDao.insert(entity)
    else:
        print('[DEBUG] entity<{entity}> is not valid ExchangeRate'.format(entity = entity))

def checkInsertColumn(entity: ExchangeRate) -> bool:
    return entity and entity.currency and entity.name
