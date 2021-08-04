from datetime import datetime
from uuid import UUID
from entity.StockRecord import StockRecord, db

def findById(id: UUID):
    return db.session.query(StockRecord).filter(StockRecord.id == id).first()

def findByCode(code: str):
    return db.session.query(StockRecord).filter(StockRecord.code == code).order_by(StockRecord.deal_date).all()

def findByCodeAndDealDate(code: str, dealDate: datetime):
    return db.session.query(StockRecord).filter(StockRecord.code == code).filter(StockRecord.deal_date == dealDate).first()

def insert(entity: StockRecord):
    db.session.add(entity)
    commit()

def update(entity: StockRecord):
    db.session.add(entity)
    commit()

def commit():
    db.session.commit()
