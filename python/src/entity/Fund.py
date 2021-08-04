from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.schema import UniqueConstraint
import uuid

from entity.BaseEntity import BaseEntity, db

class Fund(BaseEntity):
    __tablename__ = 'fund'

    id = db.Column(UUID(as_uuid = True), primary_key = True, default = uuid.uuid4)
    code = db.Column(db.String, nullable = False)
    symbol = db.Column(db.String)
    name = db.Column(db.String, nullable = False)
    isin_code = db.Column(db.String, nullable = False)
    offering_date = db.Column(db.DateTime, nullable = False)
    currency = db.Column(db.String, nullable = False)
    description = db.Column(db.String)

    UniqueConstraint('code', name = 'fund_code_key')
    UniqueConstraint('isin_code', name = 'fund_isin_code_key')
