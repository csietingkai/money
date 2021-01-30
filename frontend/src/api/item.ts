import axios from 'axios';

import { getAuthHeader } from 'util/AppUtil';
import { API_URL, ITEM_GET_ALL_PATH } from 'util/Constant';
import { ApiResponse } from 'util/Interface';

export interface Item {
    id: string;
    name: string;
    price: number;
}

export interface ItemListResponse extends ApiResponse<Item[]> { }

const getAll = async () => {
    const headers = getAuthHeader();
    const response = await axios.get(API_URL + ITEM_GET_ALL_PATH, { headers });
    const data: Item[] = response.data;
    return data;
};

export default { getAll };
