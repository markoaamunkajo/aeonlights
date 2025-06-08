
import React from 'react';

interface SocialIconLinkProps {
  href: string;
  children: React.ReactNode;
  ariaLabel: string;
}

const SocialIconLink: React.FC<SocialIconLinkProps> = ({ href, children, ariaLabel }) => {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={ariaLabel}
      className="text-black hover:text-slate-700 hover:scale-110 transform transition-all duration-200 ease-in-out"
    >
      {children}
    </a>
  );
};

export default SocialIconLink;