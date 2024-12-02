import { revalidateTag } from 'next/cache'

async function revalidateCache() {
    'use server'
    revalidateTag('articles-and-embeddings')
}

export function RefreshCacheButton() {
    return (
        <form action={revalidateCache}>
            <button
                type="submit"
                className="bg-blue-500 text-white px-4 py-2 rounded mb-4 hover:bg-blue-600"
            >
                Refresh Cache
            </button>
        </form>
    )
} 