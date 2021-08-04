from datetime import datetime

from entity.StockRecord import StockRecord
from dao import StockRecordDao

def queryByCode(code: str):
    entity = StockRecordDao.findByCode(code)
    if not entity:
        print('[DEBUG] find no code<{code}> in database'.format(code = code))
    return entity

def queryByCodeAndDealDate(code: str, dealDate: datetime):
    return StockRecordDao.findByCodeAndDealDate(code, dealDate)

def insert(entity: StockRecord):
    if isinstance(entity, StockRecord) and checkInsertColumn(entity):
        StockRecordDao.insert(entity)
    else:
        print('[DEBUG] entity<{entity}> is not valid StockRecord'.format(entity = entity))

def checkInsertColumn(entity: StockRecord) -> bool:
    return entity and entity.code and entity.deal_date and isinstance(entity.deal_share, float) and isinstance(entity.open_price, float) and isinstance(entity.high_price, float) and isinstance(entity.low_price, float) and isinstance(entity.close_price, float)

def update(entity: StockRecord):
    if isinstance(entity, StockRecord) and checkUpdateColumn(entity):
        queryEntity = StockRecordDao.findById(entity.id)
        queryEntity.deal_share = entity.deal_share
        queryEntity.open_price = entity.open_price
        queryEntity.high_price = entity.high_price
        queryEntity.low_price = entity.low_price
        queryEntity.close_price = entity.close_price
        StockRecordDao.commit()
    else:
        print('[DEBUG] entity<{entity}> is not valid StockRecord'.format(entity = entity))

def checkUpdateColumn(entity: StockRecord) -> bool:
    return checkInsertColumn(entity) and entity.id
