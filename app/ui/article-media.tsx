'use client'

import Image from 'next/image'
import React, { useEffect, useState } from 'react'
import { AspectRatio } from "@/components/ui/aspect-ratio"

interface ArticleMediaProps {
  description: string
  placeHolder: string
}

export const ArticleMedia = ({ description, placeHolder }: ArticleMediaProps) => {
    const [innerHTML, setInnerHTML] = useState<string>('');
    
    useEffect(() => {
        setInnerHTML(description);
    }, [description]);
    
    return (
        <AspectRatio ratio={16 / 9} className="relative overflow-hidden shadow-inner shadow-neutral-300 [&_img]:absolute [&_img]:min-h-full [&_img]:min-w-full [&_img]:top-1/2 [&_img]:left-1/2 [&_img]:transform [&_img]:-translate-x-1/2 [&_img]:-translate-y-1/2">
            {innerHTML ? (
                <div dangerouslySetInnerHTML={{ __html: innerHTML }}></div>
            ) : (
                <>
                    <Image
                        src="/article-search/JWTS_STScI.jpg"
                        width={1200}
                        height={675}
                        alt="Place holder background pic"
                        priority
                    />
                    <div className='text-xl font-bold w-full text-white absolute top-1/2 transform -translate-y-1/2 text-center'>
                        {placeHolder}
                    </div>
                </>
            )}
        </AspectRatio>
    );
}