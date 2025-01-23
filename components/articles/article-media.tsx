'use client'
 
import { usePathname } from 'next/navigation'
import Image from 'next/image'
import React from 'react'
import { AspectRatio } from "@/components/ui/aspect-ratio"
import { ImageData, isValidImageData } from '@/lib/types'

interface ArticleMediaProps {
    image: ImageData | null
    placeHolder: string
}

const DEFAULT_IMAGE_DIMENSIONS = {
    width: 1200,
    height: 675,
    placeholderWidth: 1600,
    placeholderHeight: 900
};

const getPlaceholderUrl = (category: string | undefined) => 
    category ? `/article-search/${category}.jpg` : '/article-search/globe.jpg';

export const ArticleMedia = ({ image, placeHolder }: ArticleMediaProps) => {
    const pathname = usePathname()
    const category = pathname.split('/')[1]
    const placeHolderPicUrl = getPlaceholderUrl(category)
    
    return (
        <AspectRatio ratio={16 / 9} className="relative overflow-hidden shadow-inner shadow-neutral-300">
            {isValidImageData(image) ? (
                <picture>
                    <img
                        src={image.src}
                        alt={image.alt || ''}
                        width={image.width || DEFAULT_IMAGE_DIMENSIONS.width}
                        height={image.height || DEFAULT_IMAGE_DIMENSIONS.height}
                        className="object-cover w-full h-full"
                    />
                </picture>
            ) : (
                <div className="relative w-full h-full">
                    <Image
                        src={placeHolderPicUrl}
                        alt={`Place holder background pic for ${category}`}
                        width={DEFAULT_IMAGE_DIMENSIONS.placeholderWidth}
                        height={DEFAULT_IMAGE_DIMENSIONS.placeholderHeight}
                        className="object-cover w-full h-full"
                        priority
                    />
                    <div className="absolute inset-0 backdrop-brightness-125 dark:backdrop-brightness-90 dark:backdrop-saturate-150 backdrop-blur-sm" />
                    <div className='text-xl font-bold w-full text-white absolute top-1/2 transform -translate-y-1/2 text-center text-shadow-md'>
                        {placeHolder}
                    </div>
                </div>
            )}
        </AspectRatio>
    );
}