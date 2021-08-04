from entity.BaseEntity import BaseEntity, db

class ExchangeRate(BaseEntity):
    __tablename__ = 'exchange_rate'

    currency = db.Column(db.String, primary_key = True)
    name = db.Column(db.String, nullable = False)
