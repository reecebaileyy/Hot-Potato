// pages/index.tsx
import React from 'react';
import Link from 'next/link';
import { XMarkIcon, ChatBubbleOvalLeftIcon } from '@heroicons/react/24/outline';

const HomePage: React.FC = () => {
  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen text-white">
      {/* Background Video Container */}
      <div className="absolute inset-0 overflow-hidden">
        <video
          className="w-full h-full object-cover"
          autoPlay
          loop
          muted
          playsInline
        >
          <source src="src/assets/videos/background.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>

      {/* Main Overlay Content */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center gap-6 p-4">
        <h1 className="text-4xl font-bold drop-shadow md:text-5xl">
          BACK BURNER STUDIOS
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

      {/* Bottom Navigation Icons */}
      <div className="absolute bottom-0 left-0 right-0 z-10 flex items-center justify-center gap-8 p-4 bg-white/60">
        <button className="p-2 bg-white rounded-full shadow hover:bg-gray-200 transition">
          <XMarkIcon className="w-6 h-6 text-gray-700" />
        </button>
        <button className="p-2 bg-white rounded-full shadow hover:bg-gray-200 transition">
          <ChatBubbleOvalLeftIcon className="w-6 h-6 text-gray-700" />
        </button>
      </div>
    </div>
  );
};

export default HomePage;
