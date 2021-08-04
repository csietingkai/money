from entity.ExchangeRateRecord import ExchangeRateRecord, db

def findByCurrency(currency: str):
    return db.session.query(ExchangeRateRecord).filter(ExchangeRateRecord.currency == currency).order_by(ExchangeRateRecord.date).all()

def insert(entity: ExchangeRateRecord):
    db.session.add(entity)
    commit()

def commit():
    db.session.commit()
