from entity.ExchangeRate import ExchangeRate, db

def findByCurrency(currency: str):
    return db.session.query(ExchangeRate).get(currency)

def insert(entity: ExchangeRate):
    db.session.add(entity)
    commit()

def commit():
    db.session.commit()
