export type Article = {
    title: string
    link: string
    pubDate: string | number
    description: string
    image: string
    source: string
    distance: number | null
    embedding: number[] | any | null
    key: string
    hidden: boolean
  }