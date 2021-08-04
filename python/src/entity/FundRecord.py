from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.schema import UniqueConstraint
import uuid

from entity.BaseEntity import BaseEntity, db

class FundRecord(BaseEntity):
    __tablename__ = 'fund_record'

    id = db.Column(UUID(as_uuid = True), primary_key = True, default = uuid.uuid4)
    code = db.Column(db.String, nullable = False)
    date = db.Column(db.DateTime, nullable = False)
    price = db.Column(db.Numeric, nullable = False)

    UniqueConstraint('code', 'date', name = 'fund_record_code_date_key')
