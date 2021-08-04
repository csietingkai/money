from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.schema import UniqueConstraint
import uuid

from entity.BaseEntity import BaseEntity, db

class ExchangeRateRecord(BaseEntity):
    __tablename__ = 'exchange_rate_record'

    id = db.Column(UUID(as_uuid = True), primary_key = True, default = uuid.uuid4)
    currency = db.Column(db.String, nullable = False)
    date = db.Column(db.DateTime, nullable = False)
    cash_buy = db.Column(db.Numeric, nullable = False)
    cash_sell = db.Column(db.Numeric, nullable = False)
    spot_buy = db.Column(db.Numeric, nullable = False)
    spot_sell = db.Column(db.Numeric, nullable = False)

    UniqueConstraint('currency', 'date', name = 'exchange_rate_record_currency_date_key')
