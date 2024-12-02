'use server'
import {
  unstable_cacheTag as cacheTag,
  // unstable_cacheLife as cacheLife,
  // revalidateTag,
} from 'next/cache'

export async function splitNumber(number: string): Promise<string> {
  'use cache'
  cacheTag('embeddings')

  await new Promise(resolve => setTimeout(resolve, 1000))
  return number.split('').join('","')
}