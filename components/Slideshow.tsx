
import React from 'react';

interface SlideshowProps {
  imageSrc: string;
  isMobileView: boolean;
}

interface ShadowConfig {
  id: string;
  color: string; // RGBA color string
  animationName: string;
  animationDelay: string;
  zIndex: string;
}

// Helper function to parse RGBA color string
const parseRgba = (rgbaString: string): { r: number; g: number; b: number; alpha: number } => {
  const match = rgbaString.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
  if (match) {
    return {
      r: parseInt(match[1], 10),
      g: parseInt(match[2], 10),
      b: parseInt(match[3], 10),
      alpha: match[4] ? parseFloat(match[4]) : 1,
    };
  }
  // Fallback for invalid strings
  console.warn("Invalid RGBA string:", rgbaString);
  return { r: 0, g: 0, b: 0, alpha: 0.1 };
};


const shadowConfigs: ShadowConfig[] = [
  { id: 'shadow4', color: 'rgba(0, 128, 255, 0.1)', animationName: 'pulse-shadow-4', animationDelay: '0.6s', zIndex: 'z-[10]' }, // Electric Blue
  { id: 'shadow3', color: 'rgba(57, 255, 20, 0.1)', animationName: 'pulse-shadow-3', animationDelay: '0.4s', zIndex: 'z-[11]' }, // Lime Green
  { id: 'shadow2', color: 'rgba(255, 0, 255, 0.2)', animationName: 'pulse-shadow-2', animationDelay: '0.2s', zIndex: 'z-[12]' }, // Magenta
  { id: 'shadow1', color: 'rgba(0, 255, 255, 0.4)', animationName: 'pulse-shadow-1', animationDelay: '0s', zIndex: 'z-[13]' }, // Cyan
];

const Slideshow: React.FC<SlideshowProps> = ({ imageSrc, isMobileView }) => {
  if (!imageSrc) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-500" role="status" aria-live="polite">
        Image not available.
      </div>
    );
  }

  const commonLayerProperties = "absolute bottom-0 object-contain max-h-full w-auto";

  // Determine positioning for parallax shadow layers
  let parallaxShadowBasePositioning: string;
  if (isMobileView) {
    // On smallest mobile (base): origin is 50% viewport - 19vw.
    // On sm mobile (and up to md): origin is 50% viewport - 12vw.
    // commonLayerProperties handles bottom alignment, object-contain, and sizing.
    parallaxShadowBasePositioning = `left-[calc(50%_-_19vw)] sm:left-[calc(50%_-_12vw)] transform -translate-x-1/2`;
  } else {
    // On desktop: fill container.
    // commonLayerProperties handles bottom alignment, object-contain, and sizing within this box.
    parallaxShadowBasePositioning = `inset-0 w-full h-full`;
  }
  const finalParallaxShadowClasses = `${commonLayerProperties} ${parallaxShadowBasePositioning}`;


  // Determine classes for the main image and its direct filter shadow.
  let mainImageAndFilterShadowBasePositioning: string;
  if (isMobileView) {
    // On mobile: commonLayerProperties handles bottom alignment. This centers horizontally.
    // These layers will be hidden on mobile.
    mainImageAndFilterShadowBasePositioning = `left-1/2 transform -translate-x-1/2`;
  } else {
    // Desktop: fill container (inset-0) and apply specific transform for left offset.
    // commonLayerProperties handles bottom alignment, object-contain, and sizing.
    mainImageAndFilterShadowBasePositioning = `inset-0 w-full h-full transform -translate-x-[20%]`;
  }
  const finalMainImageAndFilterShadowClasses = `${commonLayerProperties} ${mainImageAndFilterShadowBasePositioning}`;


  return (
    <div
      className="relative w-full h-full"
      role="img"
      aria-label="Dude with sunglasses, backed by multiple layered, colored, and animated image copies creating a parallax and pulsating glow effect"
    >
      {/* Render Parallax Image Copies */}
      {shadowConfigs.map((shadow) => {
        const colorParts = parseRgba(shadow.color);
        const shadowColorRgb = `rgb(${colorParts.r}, ${colorParts.g}, ${colorParts.b})`;

        return (
          <img
            key={shadow.id}
            src={imageSrc}
            alt={`Parallax copy of dude, ${shadow.id} effect`}
            className={`${finalParallaxShadowClasses} ${shadow.zIndex}`}
            style={{
              opacity: colorParts.alpha,
              filter: `drop-shadow(0px 0px 15px ${shadowColorRgb})`,
              animationName: shadow.animationName,
              animationDuration: '6s',
              animationTimingFunction: 'ease-in-out',
              animationIterationCount: 'infinite',
              animationDirection: 'alternate',
              animationDelay: shadow.animationDelay,
            }}
          />
        );
      })}

      {/* Pulsating Retro Color Shadow Image Copy (directly behind main image) */}
      {/* Hidden on mobile views */}
      <img
        src={imageSrc}
        alt="Pulsating retro colored silhouette of dude"
        className={`${finalMainImageAndFilterShadowClasses} z-[29] ${isMobileView ? 'hidden' : ''}`}
        style={{
          animationName: 'pulse-main-image-shadow',
          animationDuration: '5s',
          animationTimingFunction: 'ease-in-out',
          animationIterationCount: 'infinite',
        }}
      />

      {/* Main Image on Top */}
      {/* Hidden on mobile views */}
      <img
        src={imageSrc}
        alt="Dude with sunglasses"
        className={`${finalMainImageAndFilterShadowClasses} z-[30] ${isMobileView ? 'hidden' : ''}`}
      />
    </div>
  );
};

export default Slideshow;