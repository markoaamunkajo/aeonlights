
import React from 'react';

const ReleasesPage: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen bg-[#B7BCC5] pl-0 py-6 pr-6 sm:py-8 sm:pr-8 md:py-10 md:pr-10 lg:py-12 lg:pr-12 items-start justify-start">
      <div className="-translate-x-[10%]">
        <h1
          className={`
            text-[clamp(3rem,2rem+4vw,3.75rem)] md:text-6xl lg:text-[4.4rem] xl:text-[5.2rem]
            font-extrabold uppercase leading-none tracking-tighter
            text-transparent bg-clip-text bg-gradient-to-br from-yellow-400 to-yellow-600
            mb-4 md:mb-6
          `}
          aria-label="Releases Page Title"
        >
          Releases
        </h1>
        <a
          href="#" // Navigates to '#', which App.tsx interprets as the main page
          className="text-sm sm:text-base md:text-lg text-black hover:text-slate-700 underline underline-offset-4 transition-colors duration-200 ease-in-out"
          aria-label="Back to home page"
        >
          &larr; Back to Home
        </a>
      </div>
    </div>
  );
};

export default ReleasesPage;