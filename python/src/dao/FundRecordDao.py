from datetime import datetime
from uuid import UUID
from entity.FundRecord import FundRecord, db

def findById(id: UUID):
    return db.session.query(FundRecord).filter(FundRecord.id == id).first()

def findByCode(code: str):
    return db.session.query(FundRecord).filter(FundRecord.code == code).order_by(FundRecord.date).all()

def findByCodeAndDate(code: str, date: datetime):
    return db.session.query(FundRecord).filter(FundRecord.code == code).filter(FundRecord.date == date).first()

def insert(entity: FundRecord):
    db.session.add(entity)
    commit()

def update(entity: FundRecord):
    db.session.merge(entity)
    commit()

def commit():
    db.session.commit()
