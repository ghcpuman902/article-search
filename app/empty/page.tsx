"use client"; // Required for client-side interactivity

import { useState } from "react";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";

const HalftoneEffect = () => {
  // State for controlling the halftone effect
  const [dotSize, setDotSize] = useState(4); // Default dot size
  const [bleed, setBleed] = useState(0.6); // Default bleed
  const [rotation, setRotation] = useState(0); // Default rotation

  // Calculate dynamic dot size based on rotation
  const dynamicDotSize = dotSize / Math.cos((rotation * Math.PI) / 180);

  return (
    <div className="p-6 font-sans">
      <h1 className="text-2xl font-bold mb-6">Halftone Effect with React</h1>

      {/* Controls */}
      <div className="space-y-4 mb-6">

        <div>
          <Label htmlFor="dot-size">Dot Size: {dotSize}px</Label>
          <Slider
            id="dot-size"
            min={1}
            max={20}
            value={[dotSize]}
            onValueChange={([value]) => setDotSize(value)}
            className="w-64"
          />
        </div>

        <div>
          <Label htmlFor="bleed">Bleed: {bleed}</Label>
          <Slider
            id="bleed"
            min={0}
            max={1}
            step={0.1}
            value={[bleed]}
            onValueChange={([value]) => setBleed(value)}
            className="w-64"
          />
        </div>

        <div>
          <Label htmlFor="rotation">Rotation: {rotation}°</Label>
          <Slider
            id="rotation"
            min={0}
            max={360}
            value={[rotation]}
            onValueChange={([value]) => setRotation(value)}
            className="w-64"
          />
        </div>
      </div>

      {/* Halftone Effect Container */}
      <div
        className="relative w-full max-w-[800px] h-auto overflow-hidden"
        style={{ filter: "sepia(0.1)", aspectRatio: "16 / 9" }}
      >
        {/* Base Image with white border padding */}
        <div
          className="relative w-full h-full p-2 bg-white"
          style={{
            filter: "brightness(1.6) blur(0.4px) contrast(80) blur(0.1px)",
          }}
        >
          <img
            src="/article-search/astronomy.jpg"
            alt="Halftone Demo"
            className="w-full h-full object-cover rounded-lg"
            style={{ aspectRatio: "16 / 9" }}
          />

          {/* Halftone Ink Layer */}
          <div
            className="absolute inset-0 mix-blend-screen"
            style={{
              backgroundImage: `
                radial-gradient(circle at 25% 75%, black, gray, white),
                radial-gradient(circle at 75% 25%, black, gray, white),
                radial-gradient(circle at 25% 25%, yellow, lightyellow, white),
                radial-gradient(circle at 75% 75%, yellow, lightyellow, white)
              `,
              backgroundSize: `${dynamicDotSize}px ${dynamicDotSize}px`,
              transform: `rotate(${rotation}deg)`,
              opacity: bleed,
            }}
          />

          {/* YMCK Halftone Layers */}
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
            <div
              className="absolute inset-[-50%] mix-blend-multiply"
              style={{
                backgroundImage: `radial-gradient(circle at 25% 75%, black, gray, white)`,
                backgroundSize: `${dynamicDotSize}px ${dynamicDotSize}px`,
                opacity: bleed,
                transform: `rotate(${rotation + 45}deg)`,
                transformOrigin: 'center center',
              }}
            />
          </div>
        </div>


      </div>

    </div>
  );
};

export default HalftoneEffect;