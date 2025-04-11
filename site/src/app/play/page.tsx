import Image from "next/image";
import React from 'react';
import Link from 'next/link';
import { XMarkIcon, ChatBubbleOvalLeftIcon } from '@heroicons/react/24/outline';

export default function Play() {
  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen bg-gray-100">
      {/* Background - mountains + sun (placeholder) */}
      <div className="absolute inset-0 overflow-hidden">
        {/* A simple gradient or scenic background for mountains */}
        <div className="bg-gradient-to-b from-blue-200 to-blue-400 h-full w-full" />
        {/* "Sun" in the top-left corner */}
        <div className="absolute top-4 left-4 w-16 h-16 bg-yellow-300 rounded-full shadow-md" />
        {/* You could add stylized mountain shapes with absolute positioning or an SVG here */}
      </div>

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center gap-6 p-4">
        <h1 className="text-4xl font-bold text-white drop-shadow md:text-5xl">
          HJAHHAHAHA
        </h1>
        <div className="flex flex-col space-y-3 md:flex-row md:space-y-0 md:space-x-8">
          <Link href="/play" className="bg-white text-gray-800 px-6 py-2 rounded shadow hover:bg-gray-50 transition">
              Play
          </Link>
          <Link href="/leaderboard" className="bg-white text-gray-800 px-6 py-2 rounded shadow hover:bg-gray-50 transition">
           Leaderboard
          </Link>
          <Link href="/docs" className="bg-white text-gray-800 px-6 py-2 rounded shadow hover:bg-gray-50 transition">
              Docs
          </Link>
        </div>
      </div>

      {/* Bottom navigation icons */}
      <div className="absolute bottom-0 left-0 right-0 z-10 flex items-center justify-center gap-8 p-4 bg-white/60">
        {/* Example icons */}
        <button className="p-2 bg-white rounded-full shadow hover:bg-gray-200 transition">
          <XMarkIcon className="w-6 h-6 text-gray-700" />
        </button>
        <button className="p-2 bg-white rounded-full shadow hover:bg-gray-200 transition">
          <ChatBubbleOvalLeftIcon className="w-6 h-6 text-gray-700" />
        </button>
        {/* Add a "Ghost" icon or another icon as you see fit */}
      </div>
    </div>
  );
}
