import { LotteryResult } from '@/types/lotteryApiTypes';
import axios from 'axios';
import { API_BASE_URL } from '../utils/constants';


const lotteryAPI = axios.create({
    baseURL:API_BASE_URL,
    headers:{
        'Content-Type':'application/json',
    },
    timeout:10000,
})

// Error interceptor
lotteryAPI.interceptors.response.use(
    (response) => response,
    (error) => {
        console.error('Lottery API Error:',error.response?.data || error.message);
        throw error;
    }
)


/**
 * Get the latest lottery result
 * @returns The latest lottery result
 */

export async function getLatestResult() : Promise<LotteryResult> {
    const response = await lotteryAPI.get('/latest');
    return response.data;
}


/**
 * Get the lottery result for a specific date
 * @param date - The date to get the result for
 * @returns The lottery result
 */
export async function getResultByDate(date: string) : Promise<LotteryResult> {
    const response = await lotteryAPI.get(`/by-date?date=${date}`);
    return response.data;
}

