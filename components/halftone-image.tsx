import Image from 'next/image'

interface HalftoneImageProps {
    src: string
    alt: string
    width: number
    height: number
}

const HalftoneImage = ({ src, alt, width, height }: HalftoneImageProps) => {
    const dotSize = 2 // Default dot size
    const rotation = 0 // Default rotation

    // Calculate dynamic dot size based on rotation
    const dynamicDotSize = dotSize / Math.cos((rotation * Math.PI) / 180)

    return (
        <div className="brightness-[3] dark:brightness-[4]">
            <div className="relative w-full aspect-video p-2 bg-background dark:bg-black">
                {/* Base Image */}
                <div
                    className="contrast-[1.4] dark:contrast-[1.2] brightness-[0.6] saturate-[2] sepia-[0.3]"
                >
                    <Image
                        src={src}
                        alt={alt}
                        width={width}
                        height={height}
                        placeholder='empty'
                        className="w-full h-full object-cover rounded-sm"
                    />
                </div>

                {/* CMYK Halftone Layers */}
                <div className="absolute inset-0 overflow-hidden">
                    {/* Yellow Layer - 0° offset */}
                    <div
                        className="absolute inset-[-50%] mix-blend-multiply"
                        style={{
                            colorInterpolation: "sRGB",
                            backgroundImage: `radial-gradient(circle at 25% 25%, yellow, lightyellow, white)`,
                            backgroundSize: `${dynamicDotSize}px ${dynamicDotSize}px`,
                            opacity: 1,
                            transform: `rotate(${rotation + 0}deg)`,
                            transformOrigin: 'center center',
                        }}
                    />

                    {/* Magenta Layer - 15° offset */}
                    <div
                        className="absolute inset-[-50%] mix-blend-multiply"
                        style={{
                            colorInterpolation: "sRGB",
                            backgroundImage: `radial-gradient(circle at 75% 25%, magenta, lightpink, white)`,
                            backgroundSize: `${dynamicDotSize}px ${dynamicDotSize}px`,
                            opacity: 1,
                            transform: `rotate(${rotation + 15}deg)`,
                            transformOrigin: 'center center',
                        }}
                    />

                    {/* Cyan Layer - 30° offset */}
                    <div
                        className="absolute inset-[-50%] mix-blend-multiply"
                        style={{
                            colorInterpolation: "sRGB",
                            backgroundImage: `radial-gradient(circle at 75% 75%, cyan, lightcyan, white)`,
                            backgroundSize: `${dynamicDotSize}px ${dynamicDotSize}px`,
                            opacity: 1,
                            transform: `rotate(${rotation + 30}deg)`,
                            transformOrigin: 'center center',
                        }}
                    />
                </div>
            </div>
        </div>
    )
}

export default HalftoneImage 