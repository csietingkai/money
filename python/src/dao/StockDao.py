from entity.Stock import Stock, db

def findByCode(code: str) -> Stock:
    return db.session.query(Stock).filter(Stock.code == code).first()

def findBySymbol(symbol: str) -> Stock:
    return db.session.query(Stock).filter(Stock.symbol == symbol).first()

def insert(entity: Stock) -> None:
    db.session.add(entity)
    commit()

def update(entity: Stock) -> None:
    db.session.merge(entity)
    commit()

def commit() -> None:
    db.session.commit()
