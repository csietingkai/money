from entity.Stock import Stock, db

def findByCode(code: str):
    return db.session.query(Stock).filter(Stock.code == code).first()

def findBySymbol(symbol: str):
    return db.session.query(Stock).filter(Stock.symbol == symbol).first()

def insert(entity: Stock):
    db.session.add(entity)
    commit()

def update(entity: Stock):
    db.session.merge(entity)
    commit()

def commit():
    db.session.commit()
