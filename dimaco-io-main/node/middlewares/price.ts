import { UserInputError } from '@vtex/api';
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { secrets } from '../env/secrets';

export async function skuprice(ctx: Context) {
    const sku = ctx.query.sku as string | undefined;
    const hostAccount = ctx.request.header['x-vtex-account'] as string | undefined;

    if (!sku) {
        ctx.status = 400; 
        ctx.body = { code: 400, message: 'Falta el SKU' };
        throw new UserInputError('Falta el SKU');
    }

    const priceAPIConfig: AxiosRequestConfig = {
        method: 'get',
        url: `https://api.vtex.com/${hostAccount}/pricing/prices/${sku}`,
        headers: {
            'X-VTEX-API-AppKey': secrets.AppKey,
            'X-VTEX-API-AppToken': secrets.AppToken,
            'X-Vtex-Use-Https': 'true',
        },
    };

    try {
        const response: AxiosResponse = await axios(priceAPIConfig);

        if (!response.data || Object.keys(response.data).length === 0) {
            ctx.set('Cache-Control', 'no-cache');
            ctx.set('Content-Type', 'application/json');
            ctx.status = 404; 
            ctx.body = { basePrice: 0, mess: 'NOT FOUND' };
        }

        ctx.set('Cache-Control', 'no-cache');
        ctx.set('Content-Type', 'application/json');
        ctx.status = 200; 
        ctx.body = response.data;
        
    } catch (error) {
        ctx.set('Cache-Control', 'no-cache');
        ctx.set('Content-Type', 'application/json');
        ctx.status = 500; 
        ctx.body = { basePrice: 0, error };
    }
}