import axios from 'axios';

import { toDate } from 'util/AppUtil';
import { ApiResponse } from 'util/Interface';

export interface SportLotteryRecord {
    id: string;
    code: string;
    dealDate: Date;
    dealShare: number;
    openPrice: number;
    highPrice: number;
    lowPrice: number;
    closePrice: number;
}

export default {};
