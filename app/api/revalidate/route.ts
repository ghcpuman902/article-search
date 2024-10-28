import { NextRequest } from 'next/server'
import { revalidateTag, revalidatePath } from 'next/cache'
export async function POST(request: NextRequest) {
    const { type } = await request.json();
    if (type === 'tag') {
        revalidateTag('articles')
    } else if (type === 'path') {
        revalidatePath('/works/article-search', 'page')
    }
    return Response.json({ revalidated: true, type, now: new Date().toUTCString() })
}