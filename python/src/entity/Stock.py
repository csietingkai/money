from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.schema import UniqueConstraint
import uuid

from entity.BaseEntity import BaseEntity, db

class Stock(BaseEntity):
    __tablename__ = 'stock'

    id = db.Column(UUID(as_uuid = True), primary_key = True, default = uuid.uuid4)
    code = db.Column(db.String, nullable = False)
    name = db.Column(db.String, nullable = False)
    isin_code = db.Column(db.String, nullable = False)
    currency = db.Column(db.String, nullable = False)
    offering_date = db.Column(db.DateTime, nullable = False)
    market_type = db.Column(db.String, nullable = False)
    industry_type = db.Column(db.String)
    cfi_code = db.Column(db.String, nullable = False)
    symbol = db.Column(db.String)
    description = db.Column(db.String)

    UniqueConstraint('code', name='stock_code_key')
    UniqueConstraint('isin_code', name='stock_isin_code_key')
