
import React from 'react';
import { SocialLink } from '../types';
import SocialIconLink from './SocialIconLink';

interface HeaderProps {
  title: string;
  socialLinks: SocialLink[];
  onLogoClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ title, socialLinks, onLogoClick }) => {
  const handleKeyPress = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      onLogoClick();
    }
  };

  return (
    <header className="absolute left-0 right-0 flex justify-between items-center p-3 sm:p-4 md:p-6 z-20 top-[-7px] sm:top-[-10px] md:top-[-13px]">
      <button
        onClick={onLogoClick}
        onKeyPress={handleKeyPress}
        className="text-left font-extrabold uppercase tracking-wider text-black hover:text-slate-700 transition-colors cursor-pointer focus:outline-none p-1 -m-1"
        aria-label="Home page, Aeonlights logo"
        type="button"
      >
        <h1 className="text-[clamp(0.875rem,0.7rem+0.8vw,1.125rem)] md:text-base leading-none pointer-events-none"> {/* pointer-events-none if h1 is inside button to ensure button click fires */}
          {title}
        </h1>
      </button>
      <nav className="flex space-x-3 sm:space-x-4">
        {socialLinks.map((link) => (
          <SocialIconLink key={link.name} href={link.href} ariaLabel={`Visit ${link.name}`}>
            {link.icon}
          </SocialIconLink>
        ))}
      </nav>
    </header>
  );
};

export default Header;