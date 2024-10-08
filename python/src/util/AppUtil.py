import datetime
import math
from typing import Optional

def toString(s, defaultVal: Optional[str] = ''):
    if (not isinstance(s, str)) and math.isnan(s):
        s = defaultVal
    return s

def toNumber(s: Optional[str], percision: int = 2, defaultVal: Optional[float] = 0.0) -> float:
    try:
        if not s:
            return defaultVal
        s = s.replace(',', '')
        return float(format(float(s), '.' + str(percision) + 'f'))
    except Exception as e:
        print('[ERROR] ' + str(e))
        return defaultVal

def toDateStr(year: int, month: int, day: int, appender = ''):
    s = str(year)
    s += appender
    if month < 10:
        s += '0'
    s += str(month)
    s += appender
    if day < 10:
        s += '0'
    s += str(day)
    return s

def convertDateToStr(date: datetime) -> str:
    return date.strftime("%Y/%m/%d")
