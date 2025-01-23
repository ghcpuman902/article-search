import Image from 'next/image'

interface HalftoneImageProps {
    src: string
    alt: string
    width: number
    height: number
}

const HalftoneImage = ({ src, alt, width, height }: HalftoneImageProps) => {
    const dotSize = 2 // Default dot size
    const bleed = 1 // Default bleed
    const rotation = 0 // Default rotation

    // Calculate dynamic dot size based on rotation
    const dynamicDotSize = dotSize / Math.cos((rotation * Math.PI) / 180)

    return (
        <div className="relative w-full aspect-video mix-blend-darken dark:mix-blend-lighten">
            {/* Base Image */}
            <div
                className="absolute inset-0 p-2 bg-background [--brightnessy:1.5] dark:[--brightnessy:2] [--contrast:10] dark:[--contrast:1.8] [--blur:0.3px] [--blur2:0.1px] [--saturation:1.2] [--sepia:0.4]"
                style={{
                    colorInterpolation: "sRGB",
                    filter: "brightness(var(--brightnessy)) blur(var(--blur)) contrast(var(--contrast)) blur(var(--blur2)) saturate(var(--saturation)) sepia(var(--sepia))",
                }}
            >
                <Image
                    src={src}
                    alt={alt}
                    width={width}
                    height={height}
                    className="w-full h-full object-cover rounded-sm"
                    priority
                />

                {/* CMYK Halftone Layers */}
                <div className="absolute inset-0 overflow-hidden">
                    {/* Yellow Layer - 0° offset */}
                    <div
                        className="absolute inset-[-50%] mix-blend-multiply"
                        style={{
                            backgroundImage: `radial-gradient(circle at 25% 25%, yellow, lightyellow, white)`,
                            backgroundSize: `${dynamicDotSize}px ${dynamicDotSize}px`,
                            opacity: bleed,
                            transform: `rotate(${rotation + 0}deg)`,
                            transformOrigin: 'center center',
                        }}
                    />

                    {/* Magenta Layer - 15° offset */}
                    <div
                        className="absolute inset-[-50%] mix-blend-multiply"
                        style={{
                            backgroundImage: `radial-gradient(circle at 75% 25%, magenta, lightpink, white)`,
                            backgroundSize: `${dynamicDotSize}px ${dynamicDotSize}px`,
                            opacity: bleed,
                            transform: `rotate(${rotation + 15}deg)`,
                            transformOrigin: 'center center',
                        }}
                    />

                    {/* Cyan Layer - 30° offset */}
                    <div
                        className="absolute inset-[-50%] mix-blend-multiply"
                        style={{
                            backgroundImage: `radial-gradient(circle at 75% 75%, cyan, lightcyan, white)`,
                            backgroundSize: `${dynamicDotSize}px ${dynamicDotSize}px`,
                            opacity: bleed,
                            transform: `rotate(${rotation + 30}deg)`,
                            transformOrigin: 'center center',
                        }}
                    />

                    {/* Black Layer - 45° offset */}
                    {/* <div
                        className="absolute inset-[-50%] mix-blend-multiply"
                        style={{
                            backgroundImage: `radial-gradient(circle at 25% 75%, black, gray, white)`,
                            backgroundSize: `${dynamicDotSize}px ${dynamicDotSize}px`,
                            opacity: bleed,
                            transform: `rotate(${rotation + 45}deg)`,
                            transformOrigin: 'center center',
                        }}
                    /> */}
                </div>
            </div>
        </div>
    )
}

export default HalftoneImage 