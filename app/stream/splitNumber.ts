'use server'

export async function splitNumber(number: string): Promise<string> {
  await new Promise(resolve => setTimeout(resolve, 1000))
  return number.split('').join('","')
}