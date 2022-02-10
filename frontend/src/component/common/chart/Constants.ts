import { blue, green, pink, purple, yellow } from 'util/AppUtil';

export const SUPPORT_LINE_TYPE = [
    {
        key: 'ma',
        value: 'Moving Average',
        children: [
            { key: 'ma5', value: 'MA5', color: blue(), isDefault: true },
            { key: 'ma10', value: 'MA10', color: green(), isDefault: false },
            { key: 'ma20', value: 'MA20', color: purple(), isDefault: true },
            { key: 'ma40', value: 'MA40', color: pink(), isDefault: false },
            { key: 'ma60', value: 'MA60', color: yellow(), isDefault: false }
        ]
    },
    {
        key: 'bb',
        value: 'Bollinger Bands',
        children: [
            { key: 'bbup', value: 'B.Brand Up: ', color: blue(), isDefault: true },
            { key: 'ma20', value: 'MA20', color: purple(), isDefault: true },
            { key: 'bbdown', value: 'B.Brand Down', color: pink(), isDefault: true }
        ]
    }
];
