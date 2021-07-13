import re # Regular Expression
import twder

def fetchExchangeRates():
    response = twder.currency_name_dict()
    for key in response:
        s = response[key]
        s = re.sub('\(' + key + '\)', '', s);
        response[key] = s.strip()
    return response
