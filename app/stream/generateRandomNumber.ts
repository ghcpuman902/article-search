'use server'

export const generateRandomNumber =
  async () => {
    await new Promise(resolve => setTimeout(resolve, 1000))
    return Math.floor(Math.random() * 9000000000 + 1000000000).toString()
  };