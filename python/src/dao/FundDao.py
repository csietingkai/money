from entity.Fund import Fund, db

def findByCode(code: str):
    return db.session.query(Fund).filter(Fund.code == code).first()

def findByIsinCode(isinCode: str):
    return db.session.query(Fund).filter(Fund.isin_code == isinCode).first()

def insert(entity: Fund):
    db.session.add(entity)
    commit()

def update(entity: Fund):
    db.session.merge(entity)
    commit()

def commit():
    db.session.commit()
