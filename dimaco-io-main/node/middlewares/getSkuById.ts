import axios from 'axios'
import { secrets } from '../env/secrets'

export async function getSkuById(ctx: Context) {
    let id = ctx.vtex.route.params.id
    const auth_token = ctx.vtex.authToken

    const getSKU = {
        method: 'GET',
        url: `https://dimacocl.vtexcommercestable.com.br/api/catalog_system/pvt/sku/stockkeepingunitbyid/${id}`,
        headers: {
            'Content-Type': 'application/json',
            'X-VTEX-API-AppKey': secrets.AppKey,
            'X-VTEX-API-AppToken': secrets.AppToken,
            'x-vtex-use-https': "true",
            'VtexIdClientAutCookie': auth_token,
        }
    }



    try {

         //@ts-ignore
        const [skuResponse] = await Promise.allSettled([
            //@ts-ignore
            axios(getSKU),

        ]);


        const result: any = {};
        
        if (skuResponse.status === 'fulfilled') {
            result.sku = skuResponse.value.data;
        } else {
            result.skuError = skuResponse.reason.message || 'Error fetching SKU';
        }

        ctx.body = result;
        ctx.status = 200;

    } catch (error) {
        ctx.set('Cache-Control', 'no-cache');
        ctx.set('Content-Type', 'application/json');
        ctx.status = 500;
        ctx.body = { 
            basePrice: 0, 
            error: error instanceof Error ? error.message : 'Unknown error' 
        };
    }
}