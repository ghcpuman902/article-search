import { Suspense } from 'react'
import { generateRandomNumber } from './generateRandomNumber'
import { splitNumber } from './splitNumber'

async function RandomNumber() {
  const number = await generateRandomNumber()
  return <pre className="bg-gray-100 p-2 rounded mb-4">{number}</pre>
}

async function SplitNumber() {
  const number = await generateRandomNumber()
  const splitResult = await splitNumber(number)
  return <pre className="bg-gray-100 p-2 rounded">{`"${splitResult}"`}</pre>
}

export default function Page() {
  return (
    <div className="p-4 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">Streaming Demo</h1>
      <h2 className="text-xl font-semibold mb-2">Generated Number:</h2>
      <Suspense fallback={<pre className="bg-gray-100 p-2 rounded mb-4">{"0000000000"}</pre>}>
        <RandomNumber />
      </Suspense>
      <h2 className="text-xl font-semibold mb-2">Split Number:</h2>
      <Suspense fallback={<pre className="bg-gray-100 p-2 rounded mb-4">Splitting number...</pre>}>
        <SplitNumber />
      </Suspense>
      <p className="mt-4 text-sm text-gray-500">
        Page generated at: {new Date().toLocaleString()}
      </p>
    </div>
  )
}

export const revalidate = 10 // Revalidate every 10 seconds