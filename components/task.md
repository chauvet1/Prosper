You are given a task to integrate an existing React component in the codebase

The codebase should support:
- shadcn project structure  
- Tailwind CSS
- Typescript

If it doesn't, provide instructions on how to setup project via shadcn CLI, install Tailwind or Typescript.

Determine the default path for components and styles. 
If default path for components is not /components/ui, provide instructions on why it's important to create this folder
Copy-paste this component to /components/ui folder:
```tsx
responsive-masonry-layout.tsx
"use client";

import React from "react";

interface MasonryProps {
  children: React.ReactNode[];
  className?: string;
}

const Masonry = ({ children, className = "" }: MasonryProps) => {
  return (
    <div
      className={`
        columns-1 
        sm:columns-2 
        md:columns-3 
        lg:columns-4 
        xl:columns-5 
        gap-4 
        space-y-4 
        ${className}
      `}
    >
      {children.map((child, index) => (
        <div key={index} className="break-inside-avoid mb-4">
          {child}
        </div>
      ))}
    </div>
  );
};

export {Masonry};


demo.tsx
import { Masonry } from "@/components/ui/responsive-masonry-layout";

const MasonryDemo = () => {

  const imageCards = [
    <div
      key="1"
      className="group bg-white rounded-xl shadow-2xl/10 border-0 overflow-hidden transition-all duration-300 hover:-translate-y-1"
    >
      <div className="relative overflow-hidden p-4">
        <img
          src="https://picsum.photos/400/300?random=1"
          alt="Nature Photography"
          className="w-full h-48 object-cover rounded-md transition-transform duration-300 group-hover:scale-105"
        />
        
      </div>
      <div className="p-5">
        <h3 className="font-semibold text-gray-900 text-lg mb-2 group-hover:text-blue-600 transition-colors">
          Nature Photography
        </h3>
        <p className="text-gray-600 text-sm leading-relaxed">
          Beautiful landscapes and wildlife captured in stunning detail
        </p>
        <div className="mt-3 flex items-center text-xs text-gray-400">
          <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full">
            Landscapes
          </span>
        </div>
      </div>
    </div>,

    <div
      key="2"
      className="group bg-white rounded-xl shadow-2xl/10 border-0 overflow-hidden transition-all duration-300 hover:-translate-y-1"
    >
      <div className="relative overflow-hidden p-4">
        <img
          src="https://picsum.photos/400/400?random=2"
          alt="Mountain Views"
          className="w-full h-64 object-cover rounded-md transition-transform duration-300 group-hover:scale-105"
        />
        
      </div>
      <div className="p-5">
        <h3 className="font-semibold text-gray-900 text-lg mb-2 group-hover:text-blue-600 transition-colors">
          Mountain Views
        </h3>
        <p className="text-gray-600 text-sm leading-relaxed">
          Scenic mountain ranges and majestic peaks reaching for the sky
        </p>
        <div className="mt-3 flex items-center text-xs text-gray-400">
          <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
            Mountains
          </span>
        </div>
      </div>
    </div>,

    <div
      key="3"
      className="group bg-white rounded-xl shadow-2xl/10 border-0 overflow-hidden transition-all duration-300 hover:-translate-y-1"
    >
      <div className="relative overflow-hidden p-4">
        <img
          src="https://picsum.photos/400/200?random=3"
          alt="City Life"
          className="w-full h-32 object-cover rounded-md transition-transform duration-300 group-hover:scale-105"
        />
        
      </div>
      <div className="p-5">
        <h3 className="font-semibold text-gray-900 text-lg mb-2 group-hover:text-blue-600 transition-colors">
          City Life
        </h3>
        <p className="text-gray-600 text-sm leading-relaxed">
          Urban photography showcasing modern architecture and vibrant street
          scenes
        </p>
        <div className="mt-3 flex items-center text-xs text-gray-400">
          <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
            Urban
          </span>
        </div>
      </div>
    </div>,

    <div
      key="4"
      className="group bg-white rounded-xl shadow-2xl/10 border-0 overflow-hidden transition-all duration-300 hover:-translate-y-1"
    >
      <div className="relative overflow-hidden p-4">
        <img
          src="https://picsum.photos/400/350?random=4"
          alt="Sunset Collection"
          className="w-full h-56 object-cover rounded-md transition-transform duration-300 group-hover:scale-105"
        />
        
      </div>
      <div className="p-5">
        <h3 className="font-semibold text-gray-900 text-lg mb-2 group-hover:text-blue-600 transition-colors">
          Sunset Collection
        </h3>
        <p className="text-gray-600 text-sm leading-relaxed">
          Golden hour moments that paint the sky in warm, ethereal colors
        </p>
        <div className="mt-3 flex items-center text-xs text-gray-400">
          <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded-full">
            Sunsets
          </span>
        </div>
      </div>
    </div>,

    <div
      key="5"
      className="group bg-white rounded-xl shadow-2xl/10 border-0 overflow-hidden transition-all duration-300 hover:-translate-y-1"
    >
      <div className="relative overflow-hidden p-4">
        <img
          src="https://picsum.photos/400/280?random=5"
          alt="Ocean Waves"
          className="w-full h-44 object-cover rounded-md transition-transform duration-300 group-hover:scale-105"
        />
        
      </div>
      <div className="p-5">
        <h3 className="font-semibold text-gray-900 text-lg mb-2 group-hover:text-blue-600 transition-colors">
          Ocean Waves
        </h3>
        <p className="text-gray-600 text-sm leading-relaxed">
          Peaceful coastal scenes with rhythmic waves and endless horizons
        </p>
        <div className="mt-3 flex items-center text-xs text-gray-400">
          <span className="bg-cyan-100 text-cyan-700 px-2 py-1 rounded-full">
            Ocean
          </span>
        </div>
      </div>
    </div>,

    <div
      key="6"
      className="group bg-white rounded-xl shadow-2xl/10 border-0 overflow-hidden transition-all duration-300 hover:-translate-y-1"
    >
      <div className="relative overflow-hidden p-4">
        <img
          src="https://picsum.photos/400/320?random=6"
          alt="Forest Path"
          className="w-full h-52 object-cover rounded-md transition-transform duration-300 group-hover:scale-105"
        />
        
      </div>
      <div className="p-5">
        <h3 className="font-semibold text-gray-900 text-lg mb-2 group-hover:text-blue-600 transition-colors">
          Forest Path
        </h3>
        <p className="text-gray-600 text-sm leading-relaxed">
          Mystical woodland trails surrounded by ancient trees and dappled light
        </p>
        <div className="mt-3 flex items-center text-xs text-gray-400">
          <span className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full">
            Forest
          </span>
        </div>
      </div>
    </div>,

    <div
      key="7"
      className="group bg-white rounded-xl shadow-2xl/10 border-0 overflow-hidden transition-all duration-300 hover:-translate-y-1"
    >
      <div className="relative overflow-hidden p-4">
        <img
          src="https://picsum.photos/400/380?random=7"
          alt="Abstract Art"
          className="w-full h-60 object-cover rounded-md transition-transform duration-300 group-hover:scale-105"
        />
        
      </div>
      <div className="p-5">
        <h3 className="font-semibold text-gray-900 text-lg mb-2 group-hover:text-blue-600 transition-colors">
          Abstract Art
        </h3>
        <p className="text-gray-600 text-sm leading-relaxed">
          Creative digital compositions exploring form, color, and imagination
        </p>
        <div className="mt-3 flex items-center text-xs text-gray-400">
          <span className="bg-pink-100 text-pink-700 px-2 py-1 rounded-full">
            Abstract
          </span>
        </div>
      </div>
    </div>,

    <div
      key="8"
      className="group bg-white rounded-xl shadow-2xl/10 border-0 overflow-hidden transition-all duration-300 hover:-translate-y-1"
    >
      <div className="relative overflow-hidden p-4">
        <img
          src="https://picsum.photos/400/250?random=8"
          alt="Desert Landscape"
          className="w-full h-40 object-cover rounded-md transition-transform duration-300 group-hover:scale-105"
        />
        
      </div>
      <div className="p-5">
        <h3 className="font-semibold text-gray-900 text-lg mb-2 group-hover:text-blue-600 transition-colors">
          Desert Landscape
        </h3>
        <p className="text-gray-600 text-sm leading-relaxed">
          Vast sandy horizons where silence meets infinite space
        </p>
        <div className="mt-3 flex items-center text-xs text-gray-400">
          <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full">
            Desert
          </span>
        </div>
      </div>
    </div>,

    <div
      key="9"
      className="group bg-white rounded-xl shadow-2xl/10 border-0 overflow-hidden transition-all duration-300 hover:-translate-y-1"
    >
      <div className="relative overflow-hidden p-4">
        <img
          src="https://picsum.photos/400/360?random=9"
          alt="Winter Wonderland"
          className="w-full h-56 object-cover rounded-md transition-transform duration-300 group-hover:scale-105"
        />
        
      </div>
      <div className="p-5">
        <h3 className="font-semibold text-gray-900 text-lg mb-2 group-hover:text-blue-600 transition-colors">
          Winter Wonderland
        </h3>
        <p className="text-gray-600 text-sm leading-relaxed">
          Snow-covered landscapes creating a pristine, magical atmosphere
        </p>
        <div className="mt-3 flex items-center text-xs text-gray-400">
          <span className="bg-slate-100 text-slate-700 px-2 py-1 rounded-full">
            Winter
          </span>
        </div>
      </div>
    </div>,

    <div
      key="10"
      className="group bg-white rounded-xl shadow-2xl/10 border-0 overflow-hidden transition-all duration-300 hover:-translate-y-1"
    >
      <div className="relative overflow-hidden p-4">
        <img
          src="https://picsum.photos/400/290?random=10"
          alt="Street Photography"
          className="w-full h-48 object-cover rounded-md transition-transform duration-300 group-hover:scale-105"
        />
        
      </div>
      <div className="p-5">
        <h3 className="font-semibold text-gray-900 text-lg mb-2 group-hover:text-blue-600 transition-colors">
          Street Photography
        </h3>
        <p className="text-gray-600 text-sm leading-relaxed">
          Candid moments capturing the authentic rhythm of daily life
        </p>
        <div className="mt-3 flex items-center text-xs text-gray-400">
          <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
            Street
          </span>
        </div>
      </div>
    </div>,

    <div
      key="11"
      className="group bg-white rounded-xl shadow-2xl/10 border-0 overflow-hidden transition-all duration-300 hover:-translate-y-1"
    >
      <div className="relative overflow-hidden p-4">
        <img
          src="https://picsum.photos/400/420?random=11"
          alt="Architectural Marvels"
          className="w-full h-68 object-cover rounded-md transition-transform duration-300 group-hover:scale-105"
        />
        
      </div>
      <div className="p-5">
        <h3 className="font-semibold text-gray-900 text-lg mb-2 group-hover:text-blue-600 transition-colors">
          Architectural Marvels
        </h3>
        <p className="text-gray-600 text-sm leading-relaxed">
          Modern building designs that push the boundaries of form and function
        </p>
        <div className="mt-3 flex items-center text-xs text-gray-400">
          <span className="bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full">
            Architecture
          </span>
        </div>
      </div>
    </div>,

    <div
      key="12"
      className="group bg-white rounded-xl shadow-2xl/10 border-0 overflow-hidden transition-all duration-300 hover:-translate-y-1"
    >
      <div className="relative overflow-hidden p-4">
        <img
          src="https://picsum.photos/400/240?random=12"
          alt="Garden Blooms"
          className="w-full h-36 object-cover rounded-md transition-transform duration-300 group-hover:scale-105"
        />
        
      </div>
      <div className="p-5">
        <h3 className="font-semibold text-gray-900 text-lg mb-2 group-hover:text-blue-600 transition-colors">
          Garden Blooms
        </h3>
        <p className="text-gray-600 text-sm leading-relaxed">
          Colorful flower collections celebrating nature's artistic palette
        </p>
        <div className="mt-3 flex items-center text-xs text-gray-400">
          <span className="bg-rose-100 text-rose-700 px-2 py-1 rounded-full">
            Flowers
          </span>
        </div>
      </div>
    </div>,
  ];

  return (
    <div
      className={` min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-16 px-6`}
    >
      <div className="max-w-7xl mx-auto space-y-20">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent mb-6">
            Responsive Masonry Layout
          </h1>
        </div>

        {/* Image Gallery Demo */}
        <section>
          <Masonry>{imageCards}</Masonry>
        </section>
      </div>
    </div>
  );
};

export { MasonryDemo };

```

Implementation Guidelines
 1. Analyze the component structure and identify all required dependencies
 2. Review the component's argumens and state
 3. Identify any required context providers or hooks and install them
 4. Questions to Ask
 - What data/props will be passed to this component?
 - Are there any specific state management requirements?
 - Are there any required assets (images, icons, etc.)?
 - What is the expected responsive behavior?
 - What is the best place to use this component in the app?

Steps to integrate
 0. Copy paste all the code above in the correct directories
 1. Install external dependencies
 2. Fill image assets with Unsplash stock images you know exist
 3. Use lucide-react icons for svgs or logos if component requires them
