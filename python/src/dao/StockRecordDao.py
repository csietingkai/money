from datetime import datetime
from typing import List
from uuid import UUID

from entity.StockRecord import StockRecord, db

def findById(id: UUID) -> StockRecord:
    return db.session.query(StockRecord).filter(StockRecord.id == id).first()

def findByCode(code: str) -> List[StockRecord]:
    return db.session.query(StockRecord).filter(StockRecord.code == code).order_by(StockRecord.deal_date).all()

def findByCodeAndDealDate(code: str, dealDate: datetime) -> StockRecord:
    return db.session.query(StockRecord).filter(StockRecord.code == code).filter(StockRecord.deal_date == dealDate).first()

def insert(entity: StockRecord) -> None:
    db.session.add(entity)
    commit()

def update(entity: StockRecord) -> None:
    db.session.add(entity)
    commit()

def commit() -> None:
    db.session.commit()
