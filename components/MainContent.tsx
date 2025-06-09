
import React, { useEffect, useState, useRef, useLayoutEffect } from 'react';
import { MainAction, ReleaseDetail } from '../types'; // Ensure ReleaseDetail is imported
import Slideshow from './Slideshow';
import { BeatportIcon, AppleMusicIcon, JunoIcon } from '../constants'; // Removed YouTubeRedPlayIcon, ShareIcon, ExternalLinkIcon from here

interface MainContentProps {
  actions: MainAction[];
  showReleasesView: boolean;
  showUpdatesView: boolean;
  onBackClick: () => void;
}

interface ContainerShadowConfig {
  id: string;
  colorRgb: string; // e.g., "0, 128, 255"
  alpha: number;
  animationName: string;
  animationDuration: string;
  animationDelay?: string;
  zIndex: string;
}

type ActiveReleaseTab = 'MUSIC' | 'VIDEO' | 'GAME';

// initialReleasesData updated with new gameThumbnailUrl for Future Cities and buy links
const initialReleasesData: ReleaseDetail[] = [
  {
    id: 'future-cities',
    title: 'Future Cities',
    spotifyEmbedUrl: 'https://open.spotify.com/embed/album/0sNOF9WDwhWunNAHPD3Baj?utm_source=generator&theme=0',
    youtubeEmbedUrl: 'https://youtu.be/ze5ou_JHHPU?si=Bmn18c9BQdFIFM63', // Updated YouTube URL
    hasGame: true,
    gameEmbedUrl: 'https://futurecities.vercel.app/',
    gameThumbnailUrl: 'https://aamunkajo.com/wireframe_city.png',
    details: {
      credits: 'Marko Aamunkajo, Arttu Silvast',
      mastering: 'Silvast Creative',
      releaseDate: '2025-06-20',
      label: 'Elpida Music',
      distribution: 'Digital Distribution',
      isrc: 'XX-FCR-25-00001',
      genre: 'Cyberpunk / Synthwave',
      country: 'N/A',
      notes: 'Aeonlights is back on Elpida Music with Future Cities. After his last Elpida Music success with “Weekend” you can expect another typical Aeonlights signature sound with soundwave influences, cool vocals and catchy melodies.',
      beatportUrl: 'https://www.beatport.com/release/future-cities/5100342',
      appleMusicUrl: '', // Removed for Future Cities
      junoUrl: 'https://www.junodownload.com/products/aeonlights-future-cities/7132835-02/',
    },
  },
  {
    id: 'weekend',
    title: 'Weekend',
    spotifyEmbedUrl: 'https://open.spotify.com/embed/album/74QjaTR42fsJWr6V4d3oIL?utm_source=generator&theme=0',
    youtubeEmbedUrl: 'https://www.youtube.com/embed/2l3ktly9k2s',
    hasGame: false,
    details: {
      credits: 'Marko Aamunkajo',
      mastering: 'Double Helix Mastering',
      releaseDate: '2021-03-12',
      label: 'Elpida Music',
      distribution: 'Digital Distribution',
      isrc: 'FIEM22100001',
      genre: 'Electronic / House',
      country: 'Finland',
      notes: 'Warm synths, groovy basslines and a melody that stucks in the head, that’s the ideal description for Weekend. If it’s not spring yet where you are, just play this and it instantly will be. Enjoy Weekend!\n\nThis release features an interactive game experience alongside the official music video.',
      beatportUrl: 'https://www.beatport.com/release/weekend/3289628',
      appleMusicUrl: 'https://music.apple.com/us/album/weekend-single/1553907858',
    },
  },
  {
    id: 'in-search-of-sequence',
    title: 'In Search Of Sequence',
    spotifyEmbedUrl: 'https://open.spotify.com/embed/album/7AGqXhCPqunuqKMG4mDKXo?utm_source=generator&theme=0',
    youtubeEmbedUrl: '',
    hasGame: false,
    details: {
      credits: 'Heikki Eerola, Marko Aamunkajo',
      mastering: '',
      releaseDate: '2021-06-30',
      label: 'Elpida Music',
      distribution: 'Digital Distribution',
      isrc: 'USAB22200002',
      genre: 'Synthwave',
      country: 'USA',
      notes: 'A journey into nostalgic soundscapes, blending modern production with classic 80s vibes. Perfect for cruising or contemplating the future.',
      beatportUrl: 'https://www.beatport.com/release/in-search-of-sequence/3441997',
      appleMusicUrl: 'https://music.apple.com/us/album/in-search-of-sequence-single/1575187092',
    },
  },
];

const releasesData = [...initialReleasesData].sort((a, b) => {
  const dateA = new Date(a.details.releaseDate);
  const dateB = new Date(b.details.releaseDate);
  if (isNaN(dateA.getTime()) || isNaN(dateB.getTime())) {
    return 0;
  }
  return dateB.getTime() - dateA.getTime();
});

const getYouTubeVideoId = (url: string): string | null => {
  if (!url) return null;
  const patterns = [
    /youtube\.com\/embed\/([^/?#&]+)/,
    /youtube\.com\/watch\?v=([^/?#&]+)/,
    /youtu\.be\/([^/?#&]+)/,
    /youtube\.com\/v\/([^/?#&]+)/,
    /youtube\.com\/shorts\/([^/?#&]+)/
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }
  if (url.includes('/embed/')) {
    const parts = url.split('/');
    const potentialId = parts[parts.length -1];
    if (potentialId && !potentialId.includes('?')) {
        return potentialId.split('?')[0];
    }
  }
  console.warn("Could not extract YouTube video ID from URL:", url);
  return null;
};


const MainContent: React.FC<MainContentProps> = ({ actions, showReleasesView, showUpdatesView, onBackClick }) => {
  const dudeImageSrc = "https://aamunkajo.com/dude2.png";
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isTablet, setIsTablet] = useState(false);
  const [isLargeDesktop, setIsLargeDesktop] = useState(false);

  const textBlockWrapperRef = useRef<HTMLDivElement>(null);
  const textActionsAreaRef = useRef<HTMLDivElement>(null);
  const releaseViewInitializedRef = useRef<boolean>(false);
  const gamePanelRef = useRef<HTMLDivElement>(null); // Used for both desktop and mobile game panels

  const [textBlockRect, setTextBlockRect] = useState<DOMRect | null>(null);
  const [textActionsAreaRect, setTextActionsAreaRect] = useState<DOMRect | null>(null);
  const [activeReleaseTab, setActiveReleaseTab] = useState<ActiveReleaseTab>('MUSIC');
  const [currentReleaseIndex, setCurrentReleaseIndex] = useState(0);
  const [isGameFullscreen, setIsGameFullscreen] = useState(false); // Desktop game fullscreen
  const [isBrowserWindowFullscreen, setIsBrowserWindowFullscreen] = useState(false);
  const [isGameStarted, setIsGameStarted] = useState<boolean>(false);


  const touchStartXRef = useRef<number>(0);
  const touchStartYRef = useRef<number>(0);

  const currentRelease = releasesData[currentReleaseIndex];

  useEffect(() => {
    const updateScreenSizes = () => {
      const width = window.innerWidth;
      setIsMobile(width < 768);
      setIsTablet(width >= 768 && width < 1024);
      setIsLargeDesktop(width >= 1024);
    };
    updateScreenSizes();
    window.addEventListener('resize', updateScreenSizes);
    return () => window.removeEventListener('resize', updateScreenSizes);
  }, []);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(display-mode: fullscreen)');
    const handleChange = () => setIsBrowserWindowFullscreen(mediaQuery.matches);
    handleChange();
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  useLayoutEffect(() => {
    const measureElements = () => {
      const currentWidth = window.innerWidth;
      const currentIsTabletOrLargeDesktopQuery = currentWidth >= 768;

      if (showReleasesView && currentIsTabletOrLargeDesktopQuery) {
        const tbRect = textBlockWrapperRef.current?.getBoundingClientRect() || null;
        const taaRect = textActionsAreaRef.current?.getBoundingClientRect() || null;

        setTextBlockRect(tbRect);
        setTextActionsAreaRect(taaRect);

      } else {
        setTextBlockRect(null);
        setTextActionsAreaRect(null);
      }
    };

    measureElements();

    // Re-measure on resize or when relevant states change
    window.addEventListener('resize', measureElements);
    return () => {
      window.removeEventListener('resize', measureElements);
    };
  }, [showReleasesView, isTablet, isLargeDesktop]); // Effect dependencies ensure re-measurement


  useEffect(() => {
    // This effect is primarily for desktop/tablet view initialization
    if (showReleasesView && (isTablet || isLargeDesktop)) {
      if (!releaseViewInitializedRef.current) {
        releaseViewInitializedRef.current = true;
      }
    } else {
      if (releaseViewInitializedRef.current) {
        // Reset states when desktop/tablet releases view is closed
        setCurrentReleaseIndex(0);
        setActiveReleaseTab('MUSIC');
        setIsGameStarted(false);
        if (isGameFullscreen && document.fullscreenElement === gamePanelRef.current?.querySelector('iframe')) {
            document.exitFullscreen();
        }
        releaseViewInitializedRef.current = false;
      }
    }
    // For mobile, state resets are simpler or handled by unmounting/remounting the panel
    if (showReleasesView && isMobile) {
        // Reset specific mobile states if necessary, or rely on component unmount/mount
    } else if (!showReleasesView && isMobile) {
        // When mobile releases view is closed
        setCurrentReleaseIndex(0);
        setActiveReleaseTab('MUSIC');
        setIsGameStarted(false);
        // No explicit fullscreen exit needed for mobile here as we don't control it via button
    }

  }, [showReleasesView, isTablet, isLargeDesktop, isMobile, isGameFullscreen]); 

  useEffect(() => {
    if (currentRelease) {
      let currentTabStillValid = true;
      if (activeReleaseTab === 'VIDEO' && !currentRelease.youtubeEmbedUrl) {
        currentTabStillValid = false;
      } else if (activeReleaseTab === 'GAME' && (!currentRelease.hasGame || !currentRelease.gameEmbedUrl)) {
        currentTabStillValid = false;
      }

      if (!currentTabStillValid) {
        setActiveReleaseTab('MUSIC');
      }
    }
    setIsGameStarted(false);
     if (isGameFullscreen && document.fullscreenElement === gamePanelRef.current?.querySelector('iframe')) {
        // This specifically handles desktop game fullscreen exit if release changes
        document.exitFullscreen();
    }
  }, [currentRelease.id, activeReleaseTab, isGameFullscreen]);


  const handleTabClick = (tab: ActiveReleaseTab) => {
    setActiveReleaseTab(tab);
  };

  const handleNextRelease = () => {
    if (releasesData.length <= 1) return;
    setCurrentReleaseIndex((prevIndex) => (prevIndex + 1) % releasesData.length);
  };

  const handlePrevRelease = () => {
    if (releasesData.length <= 1) return;
    setCurrentReleaseIndex((prevIndex) => (prevIndex - 1 + releasesData.length) % releasesData.length);
  };

  const handleToggleGameFullscreen = () => { // For desktop game
    if (!document.fullscreenElement && gamePanelRef.current) {
      const iframe = gamePanelRef.current.querySelector('iframe');
      if (iframe) {
        iframe.requestFullscreen().catch(err => {
          console.error(`Error attempting to enable game full-screen mode: ${err.message} (${err.name})`);
        });
      }
    } else if (document.fullscreenElement) {
      document.exitFullscreen();
    }
  };


  useEffect(() => {
    const handleFullscreenChange = () => { // For desktop game
        const gameIframeElement = gamePanelRef.current?.querySelector('iframe');
        const isCurrentlyGameFullscreen = !!document.fullscreenElement && document.fullscreenElement === gameIframeElement;
        setIsGameFullscreen(isCurrentlyGameFullscreen);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const handleTouchStart = (e: React.TouchEvent) => {
    const isReleasesViewActiveForTouch = (isTablet && showReleasesView) || (isMobile && showReleasesView);
    if (!isReleasesViewActiveForTouch) return;
    touchStartXRef.current = e.touches[0].clientX;
    touchStartYRef.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const isReleasesViewActiveForTouch = (isTablet && showReleasesView) || (isMobile && showReleasesView);
    if (!isReleasesViewActiveForTouch || touchStartXRef.current === 0) return;

    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;

    const deltaX = touchEndX - touchStartXRef.current;
    const deltaY = touchEndY - touchStartYRef.current;

    const swipeThreshold = 50; 
    const verticalToHorizontalRatioThreshold = 0.75;


    if (Math.abs(deltaX) > swipeThreshold && 
        Math.abs(deltaY) < Math.abs(deltaX) * verticalToHorizontalRatioThreshold) {
      if (deltaX < 0) { // Swipe Left
        handlePrevRelease(); // Reversed: Was handleNextRelease
      } else { // Swipe Right
        handleNextRelease(); // Reversed: Was handlePrevRelease
      }
    }

    touchStartXRef.current = 0;
    touchStartYRef.current = 0;
  };
  
  const mobileSlideshowTopOffsetBase = '3.25rem'; 
  const mobileSlideshowTopOffsetSm = '3.75rem'; 

  const musicAction = actions.find(action => action.id === 'music');
  const storyAction = actions.find(action => action.id === 'story');

  const getGradientClasses = (color: string) => {
    const baseColorClass = color.replace('text-', '');
    const [colorName, shadeStr] = baseColorClass.split('-');
    const shadeValue = parseInt(shadeStr || '500', 10);
    let toColorClass = `${colorName}-${Math.min(900, shadeValue + 200)}`;
    if (colorName === "yellow") {
      toColorClass = `${colorName}-600`;
    } else if (colorName === "pink") {
       toColorClass = `${colorName}-700`;
    }
    return `bg-gradient-to-br from-${baseColorClass} to-${toColorClass}`;
  };

  const isSpecialViewActive = showReleasesView || showUpdatesView;
  const commonLinkClasses = "inline-block text-[clamp(0.75rem,0.6rem+0.7vw,0.875rem)] md:text-[13px] font-semibold uppercase tracking-wider transition-colors text-white hover:underline hover:decoration-white hover:underline-offset-4 cursor-pointer";
  const linkContainerClasses = "relative h-[calc(1.em_*_1.75)] mt-3 sm:mt-4";

  const originalTitleSizeClasses = "text-[clamp(3rem,2rem+4vw,3.75rem)] md:text-6xl lg:text-[4.4rem] xl:text-[5.2rem]";
  const reducedTitleSizeClasses = "text-[clamp(1.95rem,1.3rem+2.6vw,2.4375rem)] md:text-[2.86rem] lg:text-[2.86rem] xl:text-[2.86rem]";

  const activeViewTextBackgroundClasses = 'bg-slate-100 rounded-md px-[0.05em] py-[0.25em] w-fit';

  const shouldApplySpecialTextStylingForDesktopTablet = isTablet || isLargeDesktop;

  let desktopSlideshowContainerClasses = 'md:w-[84.93%] md:opacity-100 md:scale-100';
  if (isSpecialViewActive && shouldApplySpecialTextStylingForDesktopTablet) {
    desktopSlideshowContainerClasses = 'md:w-0 md:opacity-0 md:scale-90 md:overflow-hidden pointer-events-none';
  }

  let textActionsAreaMdClasses = 'md:w-[15.07%] md:justify-start md:items-end text-center md:text-right md:pr-6 md:py-6 lg:py-8';
  if (isSpecialViewActive && shouldApplySpecialTextStylingForDesktopTablet) {
    textActionsAreaMdClasses = 'md:w-full md:items-start md:text-left md:pl-0 md:pr-7 md:py-6 lg:py-8';
  }

  const isDesktopOrTablet = isTablet || isLargeDesktop;
  let activeViewLayoutClasses = '';

  if (isDesktopOrTablet && isSpecialViewActive) {
    activeViewLayoutClasses = 'w-full md:max-w-3xl md:-translate-x-[10%] md:pl-2.5 lg:pl-0 lg:-ml-0.5 relative';
  }


  const containerShadowConfigs: ContainerShadowConfig[] = [
    { id: 'container-shadow-3-blue', colorRgb: '0, 128, 255', alpha: 0.15, animationName: 'animate-container-shadow-3', animationDuration: '10s', zIndex: 'z-[1]', animationDelay: '0.4s' },
    { id: 'container-shadow-2-green', colorRgb: '57, 255, 20', alpha: 0.25, animationName: 'animate-container-shadow-2', animationDuration: '9s', zIndex: 'z-[2]', animationDelay: '0.2s' },
    { id: 'container-shadow-1-magenta', colorRgb: '255, 0, 255', alpha: 0.35, animationName: 'animate-container-shadow-1', animationDuration: '8s', zIndex: 'z-[3]' },
  ];

  const releaseTabButtonBaseClasses = "text-xs md:text-sm font-semibold uppercase tracking-tighter leading-none transition-colors duration-150 focus:outline-none rounded-sm px-1 py-0.5";
  const releaseTabButtonActiveClasses = "text-black font-extrabold";
  const releaseTabButtonInactiveClasses = "text-gray-500 hover:text-black";
  
  const releaseNavButtonBaseClasses = "p-1 sm:p-1.5 text-black transition-colors duration-150 focus:outline-none rounded-sm";
  const mobileReleaseNavButtonBaseClasses = "p-1.5 text-black transition-colors duration-150 focus:outline-none rounded-sm";


  // Removed desktopTabContentHeightClass as it's no longer used for dynamic height adjustment

  let panelLeftStyle = '0px';
  if (textBlockRect && textActionsAreaRect && showReleasesView && (isTablet || isLargeDesktop)) {
    panelLeftStyle = `${textBlockRect.right - textActionsAreaRect.left}px`;
  }

  const renderReleaseDetailsAndBuyLinks = (forMobile: boolean) => (
    <div className={`text-sm text-black ${forMobile ? 'mt-3' : 'overflow-y-auto custom-scrollbar pr-1 max-h-full'}`}>
      <p><span className="font-semibold">Credits:</span> {currentRelease.details.credits}</p>
      {currentRelease.details.mastering && <p className="mt-1"><span className="font-semibold">Mastering:</span> {currentRelease.details.mastering}</p>}
      <p className="mt-1"><span className="font-semibold">Release date:</span> {currentRelease.details.releaseDate}</p>
      <p className="mt-1"><span className="font-semibold">Label:</span> {currentRelease.details.label}</p>
      <p className="mt-1"><span className="font-semibold">Distribution:</span> {currentRelease.details.distribution}</p>
      <p className="mt-2 text-xs whitespace-pre-line">
        {currentRelease.details.notes}
      </p>
      
      {(currentRelease.details.beatportUrl || currentRelease.details.appleMusicUrl || currentRelease.details.junoUrl) && (
        <div className="mt-4 pt-3 border-t border-gray-300">
          <h5 className="font-semibold mb-2 text-xs uppercase tracking-wider text-gray-600">BUY</h5>
          <div className="flex flex-col space-y-2">
            {currentRelease.details.beatportUrl && currentRelease.details.beatportUrl !== '#beatport-link' && (
              <a
                href={currentRelease.details.beatportUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center text-black hover:text-lime-600 transition-colors group"
                aria-label={`Buy ${currentRelease.title} on Beatport`}
              >
                <BeatportIcon className="w-4 h-4 text-gray-700 group-hover:text-lime-600 transition-colors" />
                <span className="ml-2 text-sm">Beatport</span>
              </a>
            )}
            {currentRelease.details.appleMusicUrl && currentRelease.details.appleMusicUrl !== '#apple-music-link' && (
              <a
                href={currentRelease.details.appleMusicUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center text-black hover:text-lime-600 transition-colors group"
                aria-label={`Buy ${currentRelease.title} on Apple Music`}
              >
                <AppleMusicIcon className="w-4 h-4 text-gray-700 group-hover:text-lime-600 transition-colors" />
                <span className="ml-2 text-sm">Apple Music</span>
              </a>
            )}
            {currentRelease.details.junoUrl && currentRelease.details.junoUrl !== '#juno-link' && (
              <a
                href={currentRelease.details.junoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center text-black hover:text-lime-600 transition-colors group"
                aria-label={`Buy ${currentRelease.title} on Juno Download`}
              >
                <JunoIcon className="w-4 h-4 text-gray-700 group-hover:text-lime-600 transition-colors" />
                <span className="ml-2 text-sm">Juno</span>
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );


  return (
    <main className="relative flex flex-col md:flex-row md:gap-10 flex-grow w-full pt-12 sm:pt-16 md:pt-20 md:items-stretch">
      {/* Desktop Slideshow: Hidden if mobile releases view is active (which it won't be if md:flex is active) */}
      <div className={`
        hidden md:flex md:self-stretch md:items-start justify-start px-6 pt-6 lg:px-8 lg:pt-8
        transition-all duration-700 ease-in-out
        ${desktopSlideshowContainerClasses}
        `}>
        <div className="w-full h-[calc(100vh_-_4.5rem)] mt-[-2rem]">
          <Slideshow imageSrc={dudeImageSrc} isMobileView={false} />
        </div>
      </div>

      {/* Mobile Parallax Slideshow: Hidden if mobile releases view is active */}
      <div className={`block md:hidden fixed left-0 right-0
                     top-[3.25rem]
                     sm:top-[3.75rem]
                     bottom-0
                     z-0
                     ${(showReleasesView && isMobile) ? 'hidden' : ''} 
                     `}>
        <Slideshow imageSrc={dudeImageSrc} isMobileView={true} />
      </div>

      {/* --- Default View Content (Text Actions Area) OR Desktop/Tablet Releases Panel --- */}
      {/* This whole block is hidden if mobile releases view is active */}
      {!(showReleasesView && isMobile) && (
        <div
          ref={textActionsAreaRef}
          className={`
          w-full flex flex-col px-4 sm:px-5 py-4 relative z-10
          pb-[calc(100vh_-_1.25rem)] 
          sm:pb-[calc(100vh_-_1.75rem)] 
          md:p-0 md:pb-0 
          transition-all duration-700 ease-in-out
          ${textActionsAreaMdClasses}
          `}
        >
          {/* Desktop/Tablet Releases Panel */}
          {showReleasesView && shouldApplySpecialTextStylingForDesktopTablet && textBlockRect && textActionsAreaRect && musicAction && currentRelease && (
            <>
              {containerShadowConfigs.map(shadow => (
                <div
                  key={shadow.id}
                  className={`absolute rounded-xl pointer-events-none ${shadow.zIndex}`}
                  style={{
                    top: `${textBlockRect.top - textActionsAreaRect.top}px`,
                    left: panelLeftStyle,
                    right: '1.5rem',
                    bottom: '1.5rem',
                    backgroundColor: `rgba(${shadow.colorRgb}, ${shadow.alpha})`,
                    filter: `drop-shadow(0px 0px 12px rgba(${shadow.colorRgb}, 0.5))`,
                    animationName: shadow.animationName,
                    animationDuration: shadow.animationDuration,
                    animationDelay: shadow.animationDelay || '0s',
                    animationTimingFunction: 'ease-in-out',
                    animationIterationCount: 'infinite',
                  }}
                  aria-hidden="true"
                />
              ))}
              <div
                className={`absolute rounded-xl pointer-events-none z-[4] bg-white`}
                style={{
                  top: `${textBlockRect.top - textActionsAreaRect.top}px`,
                  left: panelLeftStyle,
                  right: '1.5rem',
                  bottom: '1.5rem',
                }}
                aria-hidden="true"
              />
              <div
                className="absolute flex rounded-xl p-1.5 z-[5] pointer-events-auto"
                style={{
                  top: `${textBlockRect.top - textActionsAreaRect.top}px`,
                  left: panelLeftStyle,
                  right: '1.5rem',
                  bottom: '1.5rem',
                }}
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
              >
                <div
                  className="flex-1 bg-gradient-to-br from-white to-slate-100 rounded-lg shadow-md overflow-y-auto"
                  aria-label="Release Details Area"
                >
                  <div className="p-4 md:p-6 h-full flex flex-col">
                    <div className="flex justify-between items-center mb-2">
                       <h3
                        className="text-xl sm:text-2xl md:text-3xl font-extrabold uppercase leading-none tracking-tighter text-black truncate pr-2"
                        aria-label={`Release Title: ${currentRelease.title}`}
                        title={currentRelease.title}
                      >
                        {currentRelease.title}
                      </h3>
                      <div className="flex items-center space-x-1 sm:space-x-2 md:space-x-3 shrink-0">
                          <div className="flex items-center" role="group" aria-label="Release Navigation">
                              <button
                                  onClick={handlePrevRelease}
                                  className={`${releaseNavButtonBaseClasses} ${releasesData.length <= 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-slate-200 focus:bg-slate-200'}`}
                                  aria-label="Previous Release"
                                  disabled={releasesData.length <= 1}
                              >
                                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-3.5 h-3.5 sm:w-4 sm:h-4">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                                  </svg>
                              </button>
                              <button
                                  onClick={handleNextRelease}
                                  className={`${releaseNavButtonBaseClasses} ${releasesData.length <= 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-slate-200 focus:bg-slate-200'} ml-0.5 sm:ml-1`}
                                  aria-label="Next Release"
                                  disabled={releasesData.length <= 1}
                              >
                                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-3.5 h-3.5 sm:w-4 sm:h-4">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                                  </svg>
                              </button>
                          </div>

                          <div className="flex items-baseline space-x-2 sm:space-x-3 md:space-x-4" role="tablist" aria-label="Release Content Tabs">
                              <button
                                  id="tab-music-desktop"
                                  role="tab"
                                  aria-selected={activeReleaseTab === 'MUSIC'}
                                  aria-controls="panel-music-desktop"
                                  onClick={() => handleTabClick('MUSIC')}
                                  className={`${releaseTabButtonBaseClasses} ${
                                  activeReleaseTab === 'MUSIC' ? releaseTabButtonActiveClasses : releaseTabButtonInactiveClasses
                                  }`}
                              >
                                  MUSIC
                              </button>
                              {currentRelease.youtubeEmbedUrl && (
                                  <button
                                      id="tab-video-desktop"
                                      role="tab"
                                      aria-selected={activeReleaseTab === 'VIDEO'}
                                      aria-controls="panel-video-desktop"
                                      onClick={() => handleTabClick('VIDEO')}
                                      className={`${releaseTabButtonBaseClasses} ${
                                      activeReleaseTab === 'VIDEO' ? releaseTabButtonActiveClasses : releaseTabButtonInactiveClasses
                                      }`}
                                  >
                                      VIDEO
                                  </button>
                              )}
                               {currentRelease.hasGame && currentRelease.gameEmbedUrl && (
                                  <button
                                      id="tab-game-desktop"
                                      role="tab"
                                      aria-selected={activeReleaseTab === 'GAME'}
                                      aria-controls="panel-game-desktop"
                                      onClick={() => handleTabClick('GAME')}
                                      className={`${releaseTabButtonBaseClasses} ${
                                      activeReleaseTab === 'GAME' ? releaseTabButtonActiveClasses : releaseTabButtonInactiveClasses
                                      }`}
                                  >
                                      GAME
                                  </button>
                              )}
                          </div>
                      </div>
                    </div>
                    <div className="border-b-2 border-black w-full mb-4" aria-hidden="true"></div>

                    <div
                      className={`flex-grow overflow-hidden`} // Removed fixed height class
                    >
                      {activeReleaseTab === 'MUSIC' && (
                        <div key={`music-panel-desktop-${currentRelease.id}`} role="tabpanel" id="panel-music-desktop" aria-labelledby="tab-music-desktop" className="animate-fadeIn h-full">
                          <div className="flex flex-col md:flex-row gap-4 md:gap-6 h-full">
                            <div className="flex-1 md:w-2/3 lg:w-3/5 h-full">
                              {(() => {
                                const releaseDate = new Date(currentRelease.details.releaseDate);
                                const today = new Date();
                                today.setHours(0,0,0,0);
                                const isFutureRelease = releaseDate > today;
                                const hasSpotifyLink = currentRelease.spotifyEmbedUrl && currentRelease.spotifyEmbedUrl.trim() !== '';

                                if (isFutureRelease || !hasSpotifyLink) {
                                  if (currentRelease.id === 'future-cities') {
                                    return (
                                      <div 
                                        className="w-full h-full rounded-lg shadow-md bg-slate-50 flex items-center justify-center"
                                        aria-label={`${currentRelease.title} cover art`}
                                      >
                                        <img
                                          src="https://aamunkajo.com/future-cities-cover.jpeg"
                                          alt={`${currentRelease.title} cover art`}
                                          className="w-full h-full object-contain rounded-lg"
                                        />
                                      </div>
                                    );
                                  }
                                  return ( // Generic placeholder
                                    <div
                                      className="w-full h-full flex items-center justify-center border-2 border-dashed border-gray-400 rounded-lg bg-slate-50"
                                      aria-label={`Spotify player placeholder for ${currentRelease.title}. ${isFutureRelease ? 'Release date is in the future.' : 'Spotify link not available.'}`}
                                    >
                                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-20 h-20 text-gray-300">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                                      </svg>
                                    </div>
                                  );
                                }
                                return ( // Spotify player
                                  <iframe
                                    className="rounded-lg shadow-md w-full h-full"
                                    src={currentRelease.spotifyEmbedUrl}
                                    allowFullScreen
                                    allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                                    loading="lazy"
                                    title={`Spotify Player for ${currentRelease.title}`}
                                  ></iframe>
                                );
                              })()}
                            </div>
                            <div className="flex-1 md:w-1/3 lg:w-2/5 flex flex-col md:justify-start items-start pt-4 md:pt-0">
                                {renderReleaseDetailsAndBuyLinks(false)}
                            </div>
                          </div>
                        </div>
                      )}
                      {activeReleaseTab === 'VIDEO' && currentRelease.youtubeEmbedUrl && (() => {
                          const videoId = getYouTubeVideoId(currentRelease.youtubeEmbedUrl);

                          if (!videoId) { // MODIFIED: Removed isFutureRelease check for video
                              return (
                                  <div
                                      className="relative w-full h-full overflow-hidden rounded-lg shadow-md bg-slate-50 border-2 border-dashed border-gray-400 flex items-center justify-center animate-fadeIn"
                                      aria-label={`YouTube video placeholder for ${currentRelease.title}. Video not available.`}
                                      role="tabpanel" id="panel-video-desktop" aria-labelledby="tab-video-desktop"
                                  >
                                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-16 h-16 sm:w-20 sm:h-20 text-gray-300">
                                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                                      </svg>
                                  </div>
                              );
                          }
                          
                          let embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=0&fs=0&rel=0`; // autoplay=0

                          return (
                               <div 
                                  key={`video-panel-wrapper-desktop-${currentRelease.id}`}
                                  role="tabpanel"
                                  id="panel-video-desktop"
                                  aria-labelledby="tab-video-desktop"
                                  className="animate-fadeIn relative w-full h-full bg-black rounded-lg shadow-md overflow-hidden" 
                              >
                                  <iframe
                                      className="w-full h-full border-0"
                                      src={embedUrl}
                                      allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                                      title={`YouTube video player for ${currentRelease.title}`}
                                      loading="lazy"
                                  ></iframe>
                              </div>
                          );
                      })()}
                     {activeReleaseTab === 'GAME' && currentRelease.hasGame && currentRelease.gameEmbedUrl && (
                          <div
                              key={`game-panel-wrapper-desktop-${currentRelease.id}-${isGameStarted}`}
                              role="tabpanel"
                              id="panel-game-desktop"
                              aria-labelledby="tab-game-desktop"
                              className={`animate-fadeIn h-full flex flex-col md:flex-row ${isGameStarted ? '' : 'gap-4 md:gap-6'}`}
                          >
                              {!isGameStarted && (
                                  <div className={`md:w-1/2 p-4 sm:p-6 flex flex-col justify-center bg-slate-100 rounded-lg shadow-inner order-2 md:order-1 animate-fadeIn`}>
                                      {currentRelease.id === 'future-cities' ? (
                                          <>
                                              <h4 className="text-lg font-semibold mb-3 text-black">Future Cities: an interactive cityscape generator</h4>
                                              <p className="text-sm text-slate-700 leading-relaxed mb-2">
                                                  Future Cities is a 80's retro style cityscape generator, where you are the lead architect.
                                              </p>
                                              <p className="text-sm text-slate-700 leading-relaxed mb-2">
                                                  New cityscapes are generated automatically to the direction you are moving in the game. Take screenshot of the unique city view by tapping on the screen.
                                              </p>
                                              <p className="text-sm text-slate-700 leading-relaxed font-semibold">
                                                  Tap START to begin your adventure!
                                              </p>
                                          </>
                                      ) : (
                                          <>
                                              <h4 className="text-lg font-semibold mb-2 text-lime-600">About the Game: {currentRelease.title}</h4>
                                              <p className="text-sm text-slate-700 leading-relaxed">
                                                  This is an interactive game experience.
                                                  <br />
                                                  Tap START to begin your adventure!
                                              </p>
                                          </>
                                      )}
                                  </div>
                              )}

                              <div
                                  ref={gamePanelRef} // Ref for desktop game panel
                                  className={`relative bg-black rounded-lg shadow-md
                                              transition-all duration-500 ease-in-out
                                              ${isGameStarted ? 'w-full h-full order-1' : 'md:w-1/2 h-full order-1 md:order-2 flex flex-col items-center justify-center'}`}
                              >
                                  {!isGameStarted && currentRelease.gameThumbnailUrl ? (
                                      <div
                                          className="relative w-full h-full flex flex-col items-center justify-center p-4 rounded-lg bg-cover bg-center"
                                          style={{ backgroundImage: `url(${currentRelease.gameThumbnailUrl})` }}
                                      >
                                          <div className="absolute inset-0 bg-black bg-opacity-60 rounded-lg"></div>
                                          <div className="relative z-10 text-center">
                                              <h3
                                                className={`text-2xl sm:text-3xl font-bold mb-2 uppercase tracking-wider drop-shadow-md ${
                                                  currentRelease.id === 'future-cities' ? 'text-lime-500' : 'text-white'
                                                }`}
                                                style={currentRelease.id === 'future-cities' ? { fontFamily: "'Press Start 2P', cursive", letterSpacing: '0.05em' } : {letterSpacing: '0.05em'}}
                                              >
                                                  {currentRelease.title}
                                              </h3>
                                              {currentRelease.id === 'future-cities' && (
                                                <p
                                                  className="text-xs text-lime-500 mb-4 sm:mb-6 uppercase tracking-wider drop-shadow-md"
                                                  style={{ fontFamily: "'Press Start 2P', cursive", letterSpacing: '0.05em' }}
                                                >
                                                  Cityscape generator
                                                </p>
                                              )}
                                              <button
                                                  onClick={() => setIsGameStarted(true)}
                                                  className="bg-lime-500 hover:bg-lime-400 text-black font-bold py-3 px-6 sm:py-4 sm:px-8 rounded-lg text-lg sm:text-xl uppercase tracking-wider shadow-xl transform transition-all duration-150 ease-in-out hover:scale-105 focus:outline-none focus:ring-2 focus:ring-lime-300 focus:ring-opacity-75"
                                                  aria-label={`Start Game: ${currentRelease.title}`}
                                              >
                                                  START
                                              </button>
                                          </div>
                                      </div>
                                  ) : isGameStarted ? (
                                      <>
                                          <iframe
                                              src={currentRelease.gameEmbedUrl + (isGameStarted ? '?autoplay=1' : '')}
                                              className="w-full h-full border-0 rounded-lg"
                                              title={`Interactive Game: ${currentRelease.title}`}
                                              allow="fullscreen gamepad autoplay; clipboard-write; web-share"
                                          ></iframe>
                                          <button
                                              onClick={handleToggleGameFullscreen} // Desktop fullscreen toggle
                                              className="absolute top-2 right-2 p-1.5 bg-black bg-opacity-60 text-white rounded-full hover:bg-opacity-80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black focus:ring-white transition-all duration-150 z-10"
                                              aria-label={isGameFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
                                          >
                                              {isGameFullscreen ? (
                                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                                                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 4H4m0 0v4M4 4l5 5m1-9h4m0 0v4m0-4l-5 5M8 20H4m0 0v-4m0 4l5-5m1 9h4m0 0v-4m0 4l-5-5" />
                                              </svg>
                                              ) : (
                                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                                                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 0h-4m4 0l-5-5" />
                                              </svg>
                                              )}
                                          </button>
                                      </>
                                  ) : (
                                       <div className="w-full h-full flex items-center justify-center p-4 text-white">
                                          <button
                                              onClick={() => setIsGameStarted(true)}
                                              className="bg-lime-500 hover:bg-lime-400 text-black font-bold py-3 px-8 rounded-lg text-xl uppercase tracking-wider shadow-lg"
                                              aria-label={`Start Game: ${currentRelease.title}`}
                                          >
                                              START
                                          </button>
                                      </div>
                                  )}
                              </div>
                          </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Default View Main Text Blocks (Music & Story actions) */}
          {/* This div is always rendered unless (showReleasesView && isMobile), so textBlockWrapperRef is stable */}
          <div className={`
            transition-transform duration-700 ease-in-out
            ${activeViewLayoutClasses} 
          `}>
            {musicAction && (
              <div className={`
                relative mb-8 sm:mb-10 md:mb-12 lg:mb-16
                transition-all duration-500 ease-in-out
                ${(showUpdatesView && shouldApplySpecialTextStylingForDesktopTablet)
                  ? 'opacity-0 scale-95 translate-y-4 pointer-events-none'
                  : 'opacity-100 scale-100 translate-y-0'
                }
                ${(showReleasesView && shouldApplySpecialTextStylingForDesktopTablet) ? 'z-[6]' : ''}
                `}>
                <div ref={textBlockWrapperRef} className="relative z-[1]">
                  <h2
                    className={`
                      ${(showReleasesView && shouldApplySpecialTextStylingForDesktopTablet) ? reducedTitleSizeClasses : originalTitleSizeClasses}
                      font-extrabold uppercase leading-none tracking-tighter text-transparent bg-clip-text
                      ${getGradientClasses(musicAction.primaryColor)}
                      ${(showReleasesView && shouldApplySpecialTextStylingForDesktopTablet) ? activeViewTextBackgroundClasses : ''}
                    `}
                  >
                    {musicAction.primaryTextLines.map((line, index) => (
                      <span key={index} className="block">{line}</span>
                    ))}
                  </h2>
                  {musicAction.secondaryText && (
                    <div className={`${linkContainerClasses}`}>
                      <a
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          onBackClick();
                        }}
                        className={`${commonLinkClasses} absolute inset-0 transition-opacity duration-300 ease-in-out ${
                          (showReleasesView && shouldApplySpecialTextStylingForDesktopTablet) ? 'opacity-100' : 'opacity-0 pointer-events-none'
                        }`}
                        aria-hidden={!(showReleasesView && shouldApplySpecialTextStylingForDesktopTablet)}
                        tabIndex={(showReleasesView && shouldApplySpecialTextStylingForDesktopTablet) ? 0 : -1}
                        role="link"
                        aria-label="Back to main view"
                      >
                        &larr; BACK
                      </a>
                      <a
                        href={musicAction.secondaryLink || '#'}
                        target={musicAction.secondaryLink?.startsWith('http') ? '_blank' : undefined}
                        rel={musicAction.secondaryLink?.startsWith('http') ? 'noopener noreferrer' : undefined}
                        onClick={(e) => {
                          const isTabletOrDesktopView = isTablet || isLargeDesktop;
                          if (isTabletOrDesktopView && musicAction.onDesktopSecondaryClick && !showReleasesView) {
                              musicAction.onDesktopSecondaryClick(e);
                          } else if (isMobile && musicAction.onDesktopSecondaryClick && !showReleasesView) { // For mobile, secondary click always activates view
                              musicAction.onDesktopSecondaryClick(e);
                          } else if (!isTabletOrDesktopView && !musicAction.onDesktopSecondaryClick && musicAction.secondaryLink) { // Mobile fallback if no onDesktopSecondaryClick
                              window.location.href = musicAction.secondaryLink;
                          }
                        }}
                        className={`${commonLinkClasses} absolute inset-0 transition-opacity duration-300 ease-in-out ${
                          !(showReleasesView && shouldApplySpecialTextStylingForDesktopTablet) ? 'opacity-100' : 'opacity-0 pointer-events-none'
                        }`}
                        aria-hidden={showReleasesView && shouldApplySpecialTextStylingForDesktopTablet}
                        tabIndex={!(showReleasesView && shouldApplySpecialTextStylingForDesktopTablet) ? 0 : -1}
                        role="link"
                        aria-label={musicAction.secondaryText}
                      >
                        {musicAction.secondaryText}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            )}

            {storyAction && (
              <div className={`
                relative mb-8 sm:mb-10 md:mb-12 lg:mb-16
                transition-all duration-500 ease-in-out
                ${(showReleasesView && shouldApplySpecialTextStylingForDesktopTablet)
                  ? 'opacity-0 scale-95 translate-y-4 pointer-events-none'
                  : 'opacity-100 scale-100 translate-y-0'
                }
                ${(showUpdatesView && shouldApplySpecialTextStylingForDesktopTablet) ? 'z-[6]' : ''}
                `}>
                <h2
                    className={`
                      relative z-[1]
                      ${(showUpdatesView && shouldApplySpecialTextStylingForDesktopTablet) ? reducedTitleSizeClasses : originalTitleSizeClasses}
                      font-extrabold uppercase leading-none tracking-tighter text-transparent bg-clip-text
                      ${getGradientClasses(storyAction.primaryColor)}
                      ${(showUpdatesView && shouldApplySpecialTextStylingForDesktopTablet) ? activeViewTextBackgroundClasses : ''}
                    `}
                >
                  {storyAction.primaryTextLines.map((line, index) => (
                    <span key={index} className="block">{line}</span>
                  ))}
                </h2>
                {storyAction.secondaryText && storyAction.secondaryLink && (
                  <div className={`${linkContainerClasses} relative z-[1]`}>
                    <a
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        onBackClick();
                      }}
                      className={`${commonLinkClasses} absolute inset-0 transition-opacity duration-300 ease-in-out ${
                        (showUpdatesView && shouldApplySpecialTextStylingForDesktopTablet) ? 'opacity-100' : 'opacity-0 pointer-events-none'
                      }`}
                      aria-hidden={!(showUpdatesView && shouldApplySpecialTextStylingForDesktopTablet)}
                      tabIndex={(showUpdatesView && shouldApplySpecialTextStylingForDesktopTablet) ? 0 : -1}
                      role="link"
                      aria-label="Back to main view"
                    >
                      &larr; BACK
                    </a>
                    <a
                      href={storyAction.secondaryLink}
                      target={storyAction.secondaryLink.startsWith('http') ? '_blank' : undefined}
                      rel={storyAction.secondaryLink.startsWith('http') ? 'noopener noreferrer' : undefined}
                      onClick={(e) => {
                          const isTabletOrDesktopView = isTablet || isLargeDesktop;
                          if (isTabletOrDesktopView && storyAction.onDesktopSecondaryClick && !showUpdatesView) {
                              storyAction.onDesktopSecondaryClick(e);
                          } else if (isMobile && storyAction.onDesktopSecondaryClick && !showUpdatesView) {
                              storyAction.onDesktopSecondaryClick(e);
                          } else if (!isTabletOrDesktopView && !storyAction.onDesktopSecondaryClick && storyAction.secondaryLink) {
                              window.location.href = storyAction.secondaryLink;
                          }
                      }}
                      className={`${commonLinkClasses} absolute inset-0 transition-opacity duration-300 ease-in-out ${
                        !(showUpdatesView && shouldApplySpecialTextStylingForDesktopTablet) ? 'opacity-100' : 'opacity-0 pointer-events-none'
                      }`}
                      aria-hidden={showUpdatesView && shouldApplySpecialTextStylingForDesktopTablet}
                      tabIndex={!(showUpdatesView && shouldApplySpecialTextStylingForDesktopTablet) ? 0 : -1}
                      role="link"
                      aria-label={storyAction.secondaryText}
                    >
                      {storyAction.secondaryText}
                    </a>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* --- NEW: Mobile Releases Panel --- */}
      {showReleasesView && isMobile && currentRelease && (
        <div 
            className="fixed inset-0 z-40 bg-gradient-to-br from-slate-50 to-slate-200 p-4 flex flex-col font-sans animate-fadeIn"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            aria-modal="true"
            role="dialog"
            aria-labelledby="mobile-release-title"
        >
          {/* Back Button */}
          <div className="flex justify-between items-center mb-1 pt-1">
            <button
              onClick={onBackClick}
              className="text-black hover:text-slate-700 p-2 rounded-md bg-slate-200 hover:bg-slate-300 transition-colors z-50"
              aria-label="Back to main view"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
              </svg>
            </button>
            <div className="flex items-center space-x-1 shrink-0">
                <button
                    onClick={handlePrevRelease}
                    className={`${mobileReleaseNavButtonBaseClasses} ${releasesData.length <= 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-slate-300 focus:bg-slate-300'}`}
                    aria-label="Previous Release"
                    disabled={releasesData.length <= 1}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                    </svg>
                </button>
                <button
                    onClick={handleNextRelease}
                    className={`${mobileReleaseNavButtonBaseClasses} ${releasesData.length <= 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-slate-300 focus:bg-slate-300'}`}
                    aria-label="Next Release"
                    disabled={releasesData.length <= 1}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                    </svg>
                </button>
            </div>
          </div>
          
          {/* Release Title */}
          <h3
            id="mobile-release-title"
            className="text-xl font-extrabold uppercase tracking-tight text-black truncate pr-2 mb-3 text-center"
            title={currentRelease.title}
          >
            {currentRelease.title}
          </h3>

          {/* Tabs */}
          <div className="flex items-baseline space-x-3 mb-3 border-b-2 border-slate-300 pb-2 justify-center" role="tablist" aria-label="Release Content Tabs Mobile">
              <button
                  id="tab-music-mobile"
                  role="tab"
                  aria-selected={activeReleaseTab === 'MUSIC'}
                  aria-controls="panel-music-mobile"
                  onClick={() => handleTabClick('MUSIC')}
                  className={`text-sm font-semibold uppercase tracking-tight leading-none transition-colors duration-150 focus:outline-none rounded-sm px-2 py-1 ${
                  activeReleaseTab === 'MUSIC' ? 'text-black font-bold border-b-2 border-black' : 'text-gray-600 hover:text-black'
                  }`}
              >
                  MUSIC
              </button>
              {currentRelease.youtubeEmbedUrl && (
                  <button
                      id="tab-video-mobile"
                      role="tab"
                      aria-selected={activeReleaseTab === 'VIDEO'}
                      aria-controls="panel-video-mobile"
                      onClick={() => handleTabClick('VIDEO')}
                      className={`text-sm font-semibold uppercase tracking-tight leading-none transition-colors duration-150 focus:outline-none rounded-sm px-2 py-1 ${
                      activeReleaseTab === 'VIDEO' ? 'text-black font-bold border-b-2 border-black' : 'text-gray-600 hover:text-black'
                      }`}
                  >
                      VIDEO
                  </button>
              )}
                {currentRelease.hasGame && currentRelease.gameEmbedUrl && (
                  <button
                      id="tab-game-mobile"
                      role="tab"
                      aria-selected={activeReleaseTab === 'GAME'}
                      aria-controls="panel-game-mobile"
                      onClick={() => handleTabClick('GAME')}
                      className={`text-sm font-semibold uppercase tracking-tight leading-none transition-colors duration-150 focus:outline-none rounded-sm px-2 py-1 ${
                      activeReleaseTab === 'GAME' ? 'text-black font-bold border-b-2 border-black' : 'text-gray-600 hover:text-black'
                      }`}
                  >
                      GAME
                  </button>
              )}
          </div>

          {/* Tab Content Area */}
          <div className="flex-grow overflow-y-auto custom-scrollbar pb-4">
            {activeReleaseTab === 'MUSIC' && (
              <div key={`mobile-music-${currentRelease.id}`} id="panel-music-mobile" role="tabpanel" aria-labelledby="tab-music-mobile" className="animate-fadeIn flex flex-col space-y-3">
                <div className="h-52 sm:h-64 w-full">
                  {(() => {
                    const releaseDate = new Date(currentRelease.details.releaseDate);
                    const today = new Date();
                    today.setHours(0,0,0,0);
                    const isFutureRelease = releaseDate > today;
                    const hasSpotifyLink = currentRelease.spotifyEmbedUrl && currentRelease.spotifyEmbedUrl.trim() !== '';

                    if (isFutureRelease || !hasSpotifyLink) {
                       if (currentRelease.id === 'future-cities') {
                        return (
                          <div 
                            className="w-full h-full rounded-lg shadow-md bg-slate-100 flex items-center justify-center"
                            aria-label={`${currentRelease.title} cover art`}
                          >
                            <img
                              src="https://aamunkajo.com/future-cities-cover.jpeg"
                              alt={`${currentRelease.title} cover art`}
                              className="w-full h-full object-contain rounded-lg"
                            />
                          </div>
                        );
                      }
                      return ( // Generic placeholder
                        <div className="w-full h-full flex items-center justify-center border-2 border-dashed border-gray-400 rounded-lg bg-slate-100"
                             aria-label={`Spotify player placeholder for ${currentRelease.title}. ${isFutureRelease ? 'Release date is in the future.' : 'Spotify link not available.'}`}>
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-16 h-16 text-gray-300">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                          </svg>
                        </div>
                      );
                    }
                    return ( // Spotify player
                      <iframe
                        className="rounded-lg shadow-md w-full h-full"
                        src={currentRelease.spotifyEmbedUrl}
                        allowFullScreen
                        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                        loading="lazy"
                        title={`Spotify Player for ${currentRelease.title}`}
                      ></iframe>
                    );
                  })()}
                </div>
                {renderReleaseDetailsAndBuyLinks(true)}
              </div>
            )}
            {activeReleaseTab === 'VIDEO' && currentRelease.youtubeEmbedUrl && (
              <div key={`mobile-video-${currentRelease.id}`} id="panel-video-mobile" role="tabpanel" aria-labelledby="tab-video-mobile" className="animate-fadeIn aspect-video w-full bg-black rounded-lg shadow-md overflow-hidden">
                {(() => {
                  const videoId = getYouTubeVideoId(currentRelease.youtubeEmbedUrl);
                  if (!videoId) { // MODIFIED: Removed isFutureRelease check for video
                    return (
                      <div className="w-full h-full flex items-center justify-center border-2 border-dashed border-gray-400 rounded-lg bg-slate-100"
                           aria-label={`YouTube video placeholder for ${currentRelease.title}. Video not available.`}>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-16 h-16 text-gray-300">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                        </svg>
                      </div>
                    );
                  }
                  const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=0&fs=0&rel=0`; // autoplay=0
                  return (
                    <iframe
                      className="w-full h-full border-0"
                      src={embedUrl}
                      allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                      title={`YouTube video player for ${currentRelease.title}`}
                      loading="lazy"
                    ></iframe>
                  );
                })()}
              </div>
            )}
            {activeReleaseTab === 'GAME' && currentRelease.hasGame && currentRelease.gameEmbedUrl && (
              <div 
                key={`mobile-game-${currentRelease.id}-${isGameStarted}`} 
                id="panel-game-mobile" 
                role="tabpanel" 
                aria-labelledby="tab-game-mobile" 
                className="animate-fadeIn h-[calc(100vh_-_15rem)] flex flex-col" // Adjusted height for mobile game area
                ref={gamePanelRef} // Ref for mobile game panel
              >
                {!isGameStarted && (
                  <div className="flex flex-col items-center justify-center p-4 bg-slate-100 rounded-lg shadow-inner flex-grow animate-fadeIn">
                    {currentRelease.gameThumbnailUrl ? (
                       <div
                            className="relative w-full h-48 sm:h-56 mb-4 rounded-lg bg-cover bg-center shadow-md"
                            style={{ backgroundImage: `url(${currentRelease.gameThumbnailUrl})` }}
                        >
                            <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg"></div>
                             <div className="relative z-10 flex flex-col items-center justify-end h-full p-4 text-center">
                                <h3
                                  className={`text-xl font-bold mb-1 uppercase tracking-wider drop-shadow-md ${
                                    currentRelease.id === 'future-cities' ? 'text-lime-400' : 'text-white'
                                  }`}
                                  style={currentRelease.id === 'future-cities' ? { fontFamily: "'Press Start 2P', cursive", letterSpacing: '0.05em', fontSize: '1rem' } : {letterSpacing: '0.05em'}}
                                >
                                    {currentRelease.title}
                                </h3>
                                {currentRelease.id === 'future-cities' && (
                                  <p
                                    className="text-[0.6rem] text-lime-400 mb-3 uppercase tracking-wider drop-shadow-md"
                                    style={{ fontFamily: "'Press Start 2P', cursive", letterSpacing: '0.05em' }}
                                  >
                                    Cityscape generator
                                  </p>
                                )}
                            </div>
                        </div>
                    ) : (
                      <h4 className="text-md font-semibold mb-2 text-black text-center">{currentRelease.title}</h4>
                    )}
                    <div className="text-center">
                        {currentRelease.id === 'future-cities' ? (
                            <>
                                <p className="text-xs text-slate-700 leading-relaxed mb-3 px-2">
                                    Future Cities is an 80's retro style cityscape generator. New cityscapes are generated automatically. Tap screen to take screenshot.
                                </p>
                            </>
                        ) : (
                             <p className="text-xs text-slate-700 leading-relaxed mb-3">
                                This is an interactive game experience.
                            </p>
                        )}
                        <button
                            onClick={() => setIsGameStarted(true)}
                            className="bg-lime-500 hover:bg-lime-400 text-black font-bold py-3 px-6 rounded-lg text-md uppercase tracking-wider shadow-lg transform transition-all duration-150 ease-in-out hover:scale-105 focus:outline-none focus:ring-2 focus:ring-lime-300"
                            aria-label={`Start Game: ${currentRelease.title}`}
                        >
                            START
                        </button>
                    </div>
                  </div>
                )}
                {isGameStarted && (
                  <div className="w-full flex-grow bg-black rounded-lg shadow-md overflow-hidden">
                    <iframe
                        src={currentRelease.gameEmbedUrl + (isGameStarted ? '?autoplay=1' : '')}
                        className="w-full h-full border-0 rounded-lg"
                        title={`Interactive Game: ${currentRelease.title}`}
                        allow="fullscreen gamepad autoplay; clipboard-write; web-share"
                    ></iframe>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
};

export default MainContent;