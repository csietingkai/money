import { Lang } from '../../util/Interface';
import zh from './translation.zh.json';
import en from './translation.en.json';

export type Dictoinary = { [lang in Lang]: Record<string, string> };
const flattenObject = (obj: any, connector: string = '.'): Record<string, string> => {
    const resultObj: Record<string, string> = {};

    for (const i in obj) {
        if (typeof obj[i] === 'object' && !Array.isArray(obj[i])) {
            const tempObj = flattenObject(obj[i]);
            for (const j in tempObj) {
                resultObj[`${i}${connector}${j}`] = tempObj[j];
            }
        } else {
            resultObj[i] = obj[i];
        }
    }
    return resultObj;
};
const dictionary: Dictoinary = {
    zh: flattenObject(zh),
    en: flattenObject(en),
};
export default dictionary;
