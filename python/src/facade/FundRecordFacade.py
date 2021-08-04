from datetime import datetime

from entity.FundRecord import FundRecord
from dao import FundRecordDao

def queryByCode(code: str):
    list = FundRecordDao.findByCode(code)
    if len(list) == 0:
        print('[DEBUG] code<{code}> has no record in database'.format(code = code))
    return list

def queryByCodeAndDate(code: str, date: datetime):
    return FundRecordDao.findByCodeAndDate(code, date)

def insert(entity: FundRecord):
    if isinstance(entity, FundRecord) and checkInsertColumn(entity):
        FundRecordDao.insert(entity)
    else:
        print('[DEBUG] entity<{entity}> is not valid FundRecord'.format(entity = entity))

def checkInsertColumn(entity: FundRecord) -> bool:
    return entity and entity.code and entity.date and isinstance(entity.price, float)

def update(entity: FundRecord):
    if isinstance(entity, FundRecord) and checkUpdateColumn(entity):
        queryEntity = FundRecordDao.findById(entity.id)
        queryEntity.price = entity.price
        FundRecordDao.commit()
    else:
        print('[DEBUG] entity<{entity}> is not valid FundRecord'.format(entity = entity))

def checkUpdateColumn(entity: FundRecord) -> bool:
    return checkInsertColumn(entity) and entity.id
