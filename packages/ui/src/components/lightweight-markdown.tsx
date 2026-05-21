"use client"

import * as React from "react"
import { cn } from "@workspace/ui/lib/utils"

const inlinePattern = /(\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\))/g

const renderInline = (text: string, keyPrefix: string) => {
  const parts = text.split(inlinePattern).filter(Boolean)

  return parts.map((part, index) => {
    const key = `${keyPrefix}-${index}`

    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={key} className="font-medium text-foreground">
          {part.slice(2, -2)}
        </strong>
      )
    }

    const linkMatch = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/)
    if (linkMatch) {
      return (
        <a
          key={key}
          href={linkMatch[2]}
          target="_blank"
          rel="noopener noreferrer"
          className="underline underline-offset-3 hover:text-foreground"
        >
          {linkMatch[1]}
        </a>
      )
    }

    return <React.Fragment key={key}>{part}</React.Fragment>
  })
}

type Block =
  | { type: "h2"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "p"; text: string }

const parseMarkdown = (content: string): Block[] => {
  const blocks: Block[] = []
  const lines = content.trim().split("\n")
  let paragraph: string[] = []
  let listItems: string[] = []

  const flushParagraph = () => {
    if (paragraph.length === 0) return
    blocks.push({ type: "p", text: paragraph.join(" ") })
    paragraph = []
  }

  const flushList = () => {
    if (listItems.length === 0) return
    blocks.push({ type: "ul", items: listItems })
    listItems = []
  }

  for (const line of lines) {
    const trimmed = line.trim()

    if (!trimmed) {
      flushList()
      flushParagraph()
      continue
    }

    if (trimmed.startsWith("## ")) {
      flushList()
      flushParagraph()
      blocks.push({ type: "h2", text: trimmed.slice(3).trim() })
      continue
    }

    if (trimmed.startsWith("- ")) {
      flushParagraph()
      listItems.push(trimmed.slice(2).trim())
      continue
    }

    flushList()
    paragraph.push(trimmed)
  }

  flushList()
  flushParagraph()

  return blocks
}

type LightweightMarkdownProps = {
  content: string
  className?: string
}

export const LightweightMarkdown = ({ content, className }: LightweightMarkdownProps) => {
  const blocks = React.useMemo(() => parseMarkdown(content), [content])

  return (
    <div className={cn("flex flex-col gap-[0.618rem]", className)}>
      {blocks.map((block, index) => {
        const key = `block-${index}`

        if (block.type === "h2") {
          return (
            <h3
              key={key}
              className="text-sm font-medium uppercase tracking-wide text-foreground/70"
            >
              {renderInline(block.text, key)}
            </h3>
          )
        }

        if (block.type === "ul") {
          return (
            <ul key={key} className="flex list-none flex-col gap-[0.382rem] pl-0">
              {block.items.map((item, itemIndex) => (
                <li
                  key={`${key}-item-${itemIndex}`}
                  className="text-sm leading-relaxed text-muted-foreground"
                >
                  {renderInline(item, `${key}-item-${itemIndex}`)}
                </li>
              ))}
            </ul>
          )
        }

        return (
          <p key={key} className="text-sm leading-relaxed text-muted-foreground">
            {renderInline(block.text, key)}
          </p>
        )
      })}
    </div>
  )
}
