from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

class BaseEntity(db.Model):
    """Base data model for all objects"""
    __abstract__ = True

    def __init__(self, *args):
        super().__init__(*args)

    def __str__(self):
        return '<{klass} {attrs}>'.format(
            klass = self.__class__.__name__,
            attrs=" ".join("{}={!r}".format(k, v) for k, v in filter(lambda x: (not x[0].startswith('_')), self.__dict__.items())),
        )
