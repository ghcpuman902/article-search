import {
    unstable_cacheTag as cacheTag,
    unstable_cacheLife as cacheLife,
    // revalidateTag,
} from 'next/cache'

import { Suspense } from 'react'
import { generateRandomNumber } from './generateRandomNumber'
import { splitNumber } from './splitNumber'
// import { RefreshCacheButton } from './components/RefreshCacheButton'


async function RandomNumber() {
    const number = await generateRandomNumber()

    return (
        <>
            <pre className="bg-gray-100 p-2 rounded mb-4">{number}</pre>
            <p className="text-xs text-gray-500 mb-4">
                Data generated at: {new Date().toLocaleString()}
            </p>
            <Suspense fallback={<pre className="bg-gray-100 p-2 rounded mb-4">Splitting number...</pre>}>
                <SplitNumber number={number} />
            </Suspense>
        </>
    )
}

async function SplitNumber({ number }: { number: string }) {
    const splitResult = await splitNumber(number)

    return (
        <>
            <h2 className="text-xl font-semibold mb-2">Split Number:</h2>
            <pre className="bg-gray-100 p-2 rounded">{`"${splitResult}"`}</pre>
        </>
    )
}

export default async function Page() {
    'use cache'
    cacheLife({
        stale: 60 * 30, // 30 minutes
        revalidate: 60 * 60 * 1, // 1 hour
        expire: 60 * 60 * 2, // 2 hours
      })
    cacheTag('articles-and-embeddings')

    return (
        <div className="p-4 max-w-md mx-auto">
            <h1 className="text-2xl font-bold mb-4">Dynamic Caching Demo</h1>

            {/* <RefreshCacheButton /> */}

            <p className="text-sm text-gray-500 mb-4">
                Page rendered at: {new Date().toLocaleString()}
            </p>

            <h2 className="text-xl font-semibold mb-2">Generated Number:</h2>
            <Suspense fallback={<pre className="bg-gray-100 p-2 rounded mb-4">Generating number...</pre>}>
                <RandomNumber />
            </Suspense>
        </div>
    )
}