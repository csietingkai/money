import re # Regular Expression
import twder

def fetchExchangeRates():
    response = twder.currency_name_dict()
    for key in response:
        s = response[key]
        s = re.sub('\(' + key + '\)', '', s);
        response[key] = s.strip()
    return response

def fetchExchangeRateRecords(currency, year, month, day):
    data = twder.specify_month(currency, year, month)
    returnData = {}
    for x in data:
        if (day != None):
            dateFormat = '{year:04d}/{month:02d}/{day:02d}'
            dateStr = dateFormat.format(year = year, month = month, day = day)
            if dateStr == x[0]:
                returnData[x[0]] = [x[1], x[2], x[3], x[4]]
                break
        else:
            returnData[x[0]] = [x[1], x[2], x[3], x[4]]
    return returnData
