export const revalidate = 0

import { fetchAllJapanArticles } from '../../lib/fetchRSS';

export async function GET(request: Request) {
    const {articles, successfulSources, updateTime} = await fetchAllJapanArticles();
    const env = process.env.NODE_ENV;
    const referer = request.headers.get('referer');
    const key = request.headers.get('Authorization');


    var expireDate = new Date(updateTime);
    expireDate.setHours(expireDate.getHours() + 1); 

    console.log(`GET Japan articles, time now:${new Date().toUTCString()} expireDate:${expireDate.toUTCString()}`);

    // if(env === "development"){
        if ( !key || key != 'Bearer '+process.env.NEXT_PUBLIC_APP_INTERNAL_API_KEY ) {
            return Response.json(`Unauthorized, key: '${key}'`, { status: 401 });
        }
        return Response.json({articles, successfulSources, updateTime}, {
            headers: {
                'Content-Type': 'application/json',
                'Cache-Control': 'no-cache',
                'Expires': expireDate.toUTCString(),
                'Pragma': 'no-cache',
                'Access-Control-Allow-Methods': 'GET',
                'Access-Control-Allow-Headers': 'Content-Type',
            }
        });
    // }
    // else if (env === "production"){
    //     if (!referer || !referer.startsWith('https://manglekuo.com') || !key || key != 'Bearer '+process.env.NEXT_PUBLIC_APP_INTERNAL_API_KEY) {
    //         return Response.json(`Unauthorized, referer:${referer}, key:${key}`, { status: 401 });
    //     }
    //     return Response.json({articles, successfulSources, updateTime}, {
    //         headers: {
    //             'Content-Type': 'application/json',
    //             'Cache-Control': 'no-cache',
    //             'Expires': expireDate.toUTCString(),
    //             'Pragma': 'no-cache',
    //             'Access-Control-Allow-Origin': 'https://manglekuo.com',
    //             'Access-Control-Allow-Methods': 'GET',
    //             'Access-Control-Allow-Headers': 'Content-Type',
    //         },
    //     });
    // }
}