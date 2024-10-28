import { type NextRequest, NextResponse } from 'next/server'


async function getEmbedding(inputString: string, host: string | null) {
    let urlPrefix = '';
    host = host ? host : 'manglekuo.com'
    if (host.includes('localhost') || host.includes('.local')) {
        urlPrefix = 'http://' + host;
    } else {
        urlPrefix = 'https://' + host;
    }
    const res = await fetch(urlPrefix + "/works/article-search/api/internal_embedding", {
        method: 'POST',
        headers: {
            'Referer': 'https://manglekuo.com',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ "text": inputString, "key": process.env.NEXT_PUBLIC_APP_INTERNAL_API_KEY }),
        redirect: 'follow',
        cache: 'force-cache'
    });
    const resJson = await res.json();
    return resJson.result ? resJson.result : [];
}

export async function POST(request: NextRequest) {
    const { query } = await request.json();

    const text = query.toLowerCase()
        .replace(/\s+/g, ' ')
        .trim().slice(0, 280);

    if(!text){
        return NextResponse.json('Bad request', { status: 400 });
    }
    // Get embedding for new query 
    let embedding = await getEmbedding(text, request.headers.get('host'));

    // if (process.env.NODE_ENV == "development") {
        return NextResponse.json({ result: embedding });
    // }
    // else if (process.env.NODE_ENV == "production") {
    //     const referer = request.headers.get('referer');
    //     if (!referer || !referer.startsWith('https://manglekuo.com')) {
    //         return NextResponse.json('Unauthorized', { status: 401 });
    //     }
    //     return NextResponse.json({ result: embedding }, {
    //         headers: {
    //             'Access-Control-Allow-Origin': 'https://manglekuo.com',
    //             'Access-Control-Allow-Methods': 'POST',
    //             'Access-Control-Allow-Headers': 'Content-Type',
    //             'Content-Type': 'application/json',
    //         },
    //     });
    // }
}