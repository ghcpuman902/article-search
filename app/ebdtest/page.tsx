'use client'

import React, { useState } from 'react'
import { generateEmbeddings } from '@/app/actions/getEmbeddings'
import { Article } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

type TestArticle = Pick<Article, 'title' | 'description'>

const sampleArticles: TestArticle[] = [
  { title: "Next.js 15 Released", description: "Exciting new features in Next.js 15 including improved performance and developer experience." },
  { title: "The Future of React", description: "Exploring upcoming changes and improvements in React's roadmap." },
  { title: "Mastering TypeScript", description: "Tips and tricks to become proficient in TypeScript for large-scale applications." },
  { title: "Tailwind CSS Best Practices", description: "Learn how to efficiently use Tailwind CSS in your projects." },
  { title: "AI in Web Development", description: "How artificial intelligence is shaping the future of web development." },
]

export default function TestPage() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<(TestArticle & { distance: number, key: string })[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const handleSearch = async () => {
    setIsLoading(true)
    try {
      const articlesWithDummyData = sampleArticles.map(article => ({
        ...article,
        link: "#",
        pubDate: new Date().toISOString(),
        image: "",
        source: "Sample",
        content: "",
        category: "",
        author: "",
        guid: crypto.randomUUID(),
        distance: 0,
        embedding: [],
        key: crypto.randomUUID(),
        hidden: false
      }))
      const sortedArticles = await generateEmbeddings(query, articlesWithDummyData)
      setResults(sortedArticles)
    } catch (error) {
      console.error('Error generating embeddings:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <h1 className="text-2xl font-bold mb-4">Article Search Test</h1>
      <div className="flex gap-2 mb-4">
        <Input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Enter search query"
          className="flex-grow"
        />
        <Button onClick={handleSearch} disabled={isLoading}>
          {isLoading ? 'Searching...' : 'Search'}
        </Button>
      </div>
      <div className="space-y-4">
        {results.map((article) => (
          <Card key={article.key}>
            <CardHeader>
              <CardTitle>{article.title}</CardTitle>
              <CardDescription>{article.description}</CardDescription>
              <p className="text-sm text-muted-foreground mt-2">
                Similarity: {(1 - article.distance).toFixed(4)}
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Distance: {article.distance.toFixed(4)}
              </p>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  )
}