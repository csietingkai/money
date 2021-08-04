from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.schema import UniqueConstraint
import uuid

from entity.BaseEntity import BaseEntity, db

class StockRecord(BaseEntity):
    __tablename__ = 'stock_record'

    id = db.Column(UUID(as_uuid = True), primary_key = True, default = uuid.uuid4)
    code = db.Column(db.String, nullable = False)
    deal_date = db.Column(db.DateTime, nullable = False)
    deal_share = db.Column(db.Numeric, nullable = False)
    open_price = db.Column(db.Numeric, nullable = False)
    high_price = db.Column(db.Numeric, nullable = False)
    low_price = db.Column(db.Numeric, nullable = False)
    close_price = db.Column(db.Numeric, nullable = False)

    UniqueConstraint('code', 'deal_date', name='stock_record_code_deal_date_key')
