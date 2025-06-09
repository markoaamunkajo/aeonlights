
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Header from './components/Header';
import MainContent from './components/MainContent';
// ReleasesPage import is kept for now, though its direct hash-based routing is less prominent.
import ReleasesPage from './components/ReleasesPage'; 
import { FacebookIcon, InstagramIcon, XIcon, SpotifyIcon } from './constants';
import { SocialLink, MainAction } from './types';

const App: React.FC = () => {
  const [currentPath, setCurrentPath] = useState(window.location.hash || '#');
  const [showReleasesView, setShowReleasesView] = useState(false);
  const [showUpdatesView, setShowUpdatesView] = useState(false);

  useEffect(() => {
    const handleHashChange = () => {
      const newPath = window.location.hash || '#';
      setCurrentPath(newPath);

      // If a special view is active AND the new path is NOT the base path
      // (e.g., navigating to #releases or #updates via URL bar or other links)
      // deactivate the special views.
      if ((showReleasesView || showUpdatesView) && newPath !== '#' && newPath !== '') {
         setShowReleasesView(false); 
         setShowUpdatesView(false);
      }
    };

    window.addEventListener('hashchange', handleHashChange, false);
    handleHashChange(); // Initial call

    return () => {
      window.removeEventListener('hashchange', handleHashChange, false);
    };
  }, [showReleasesView, showUpdatesView]); // Effect dependency

  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    if (showReleasesView || showUpdatesView) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = originalOverflow || ''; // Restore to original or default
    }
    // Cleanup function
    return () => {
      document.body.style.overflow = originalOverflow || ''; // Restore to original value on unmount or before effect runs again
    };
  }, [showReleasesView, showUpdatesView]);

  const socialLinks: SocialLink[] = [
    { name: 'Spotify', href: 'https://open.spotify.com/artist/6ETqKRnxshk8huuB8ubj64?si=Jk_ZJkTZQD66KoQdTfK1fA', icon: <SpotifyIcon className="w-[clamp(0.75rem,0.5rem+1vw,1rem)] h-[clamp(0.75rem,0.5rem+1vw,1rem)]" /> },
    { name: 'Facebook', href: 'https://facebook.com/aeonlightsmusic', icon: <FacebookIcon className="w-[clamp(0.75rem,0.5rem+1vw,1rem)] h-[clamp(0.75rem,0.5rem+1vw,1rem)]" /> },
    { name: 'Instagram', href: 'https://instagram.com/aeonlights', icon: <InstagramIcon className="w-[clamp(0.75rem,0.5rem+1vw,1rem)] h-[clamp(0.75rem,0.5rem+1vw,1rem)]" /> },
    { name: 'X', href: 'https://x.com/aeonlights', icon: <XIcon className="w-[clamp(0.75rem,0.5rem+1vw,1rem)] h-[clamp(0.75rem,0.5rem+1vw,1rem)]" /> },
  ];
  
  const handleMusicSecondaryClick = useCallback((event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault(); // Prevent navigation
    setShowReleasesView(true);
    setShowUpdatesView(false); // Ensure other view is off
    // Ensure we are conceptually at the "home" page when this view is active
    if (window.location.hash !== '#' && window.location.hash !== '') {
      window.location.hash = '#'; 
    }
    setCurrentPath('#'); // Sync internal state
  }, [setShowReleasesView, setShowUpdatesView, setCurrentPath]);

  // handleStorySecondaryClick remains, but is no longer tied to the "UPDATES ->" button's desktop action
  const handleStorySecondaryClick = useCallback((event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault(); // Prevent navigation
    setShowUpdatesView(true);
    setShowReleasesView(false); // Ensure other view is off
    if (window.location.hash !== '#' && window.location.hash !== '') {
      window.location.hash = '#';
    }
    setCurrentPath('#'); // Sync internal state
  }, [setShowUpdatesView, setShowReleasesView, setCurrentPath]);

  const mainActions: MainAction[] = useMemo(() => [
    {
      id: 'music',
      primaryTextLines: ['PLAY', 'THE', 'MUSIC'],
      primaryColor: 'text-yellow-400',
      primaryColorRgbEquivalent: '250, 204, 21', // Corresponds to Tailwind's yellow-400 (#facc15)
      secondaryText: 'RELEASES →',
      secondaryLink: 'https://futurecities.vercel.app/', // Fallback/mobile link
      onDesktopSecondaryClick: handleMusicSecondaryClick,
    },
    {
      id: 'story',
      primaryTextLines: ['LIVE', 'THE', 'STORY'],
      primaryColor: 'text-pink-500',
      primaryColorRgbEquivalent: '236, 72, 153', // Corresponds to Tailwind's pink-500 (#ec4899)
      secondaryText: 'UPDATES →',
      secondaryLink: 'https://www.instagram.com/aeonlights/', 
      // onDesktopSecondaryClick: handleStorySecondaryClick, // Removed: This link now goes to Instagram directly
    },
  ], [handleMusicSecondaryClick, handleStorySecondaryClick]);

  const handleLogoClick = () => {
    setShowReleasesView(false);
    setShowUpdatesView(false);
    if (window.location.hash !== '#' && window.location.hash !== '') {
      window.location.hash = '#';
    }
    setCurrentPath('#'); // Sync internal state
  };

  const renderContent = () => {
    // The ReleasesPage component is not directly used by the new 'showReleasesView' logic on desktop.
    // It remains for direct hash access if needed.
    // Similarly, if an UpdatesPage component were created, it would be handled here.
    if (currentPath === '#/releases' && !showReleasesView && !showUpdatesView) { 
      return <ReleasesPage />;
    }
    // Example for a potential UpdatesPage, though not built yet:
    // if (currentPath === '#/updates' && !showReleasesView && !showUpdatesView) {
    //   return <UpdatesPage />; 
    // }
    return (
      <>
        <Header title="AEONLIGHTS" socialLinks={socialLinks} onLogoClick={handleLogoClick} />
        <MainContent 
          actions={mainActions} 
          showReleasesView={showReleasesView} 
          showUpdatesView={showUpdatesView}
          onBackClick={handleLogoClick} 
        />
      </>
    );
  };

  return (
    <div className="relative flex flex-col min-h-screen bg-[#B7BCC5] text-black font-sans overflow-x-hidden">
      {renderContent()}
    </div>
  );
};

export default App;
