from entity.ExchangeRateRecord import ExchangeRateRecord
from dao import ExchangeRateRecordDao

def queryByCurrency(currency: str) -> list:
    list = ExchangeRateRecordDao.findByCurrency(currency)
    if len(list) == 0:
        print('[DEBUG] currency<{currency}> has no record in database'.format(currency = currency))
    return list

def insert(entity: ExchangeRateRecord) -> int:
    if isinstance(entity, ExchangeRateRecord) and checkInsertColumn(entity):
        ExchangeRateRecordDao.insert(entity)
        return 1
    else:
        print('[DEBUG] entity<{entity}> is not valid ExchangeRateRecord'.format(entity = entity))
        return 0

def checkInsertColumn(entity: ExchangeRateRecord) -> bool:
    return entity and entity.currency and entity.date and isinstance(entity.cash_buy, float) and isinstance(entity.cash_sell, float) and isinstance(entity.spot_buy, float) and isinstance(entity.spot_sell, float)
