import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
}

const Logo: React.FC<LogoProps> = ({ 
  size = 'md', 
  showText = true, 
  className = '' 
}) => {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-3xl',
    xl: 'text-4xl'
  };

  return (
    <div className={`flex items-center gap-3 group ${className}`}>
      {/* Custom SVG Logo */}
      <div className={`${sizeClasses[size]} group-hover:scale-110 transition-transform duration-300`}>
        <svg
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          {/* Modern Clapperboard Design */}
          <rect
            x="15"
            y="25"
            width="70"
            height="50"
            rx="12"
            fill="url(#gradient1)"
            stroke="url(#gradient2)"
            strokeWidth="2"
          />
          
          {/* Clapperboard Handle */}
          <rect
            x="20"
            y="15"
            width="8"
            height="15"
            rx="4"
            fill="url(#gradient2)"
          />
          
          {/* Clapperboard Slate */}
          <rect
            x="25"
            y="30"
            width="50"
            height="35"
            rx="6"
            fill="url(#gradient3)"
            stroke="white"
            strokeWidth="1.5"
          />
          
          {/* Film Strip Lines */}
          <rect x="30" y="35" width="40" height="2" rx="1" fill="white" opacity="0.8" />
          <rect x="30" y="40" width="40" height="2" rx="1" fill="white" opacity="0.6" />
          <rect x="30" y="45" width="40" height="2" rx="1" fill="white" opacity="0.4" />
          <rect x="30" y="50" width="40" height="2" rx="1" fill="white" opacity="0.6" />
          <rect x="30" y="55" width="40" height="2" rx="1" fill="white" opacity="0.8" />
          
          {/* Play Button - Modern Style */}
          <circle
            cx="50"
            cy="50"
            r="12"
            fill="white"
            stroke="url(#gradient1)"
            strokeWidth="2"
          />
          
          {/* Play Triangle */}
          <path
            d="M45 42 L45 58 L58 50 Z"
            fill="url(#gradient1)"
          />
          
          {/* Modern Accent Elements */}
          <circle cx="25" cy="35" r="2" fill="white" opacity="0.6" />
          <circle cx="75" cy="35" r="2" fill="white" opacity="0.6" />
          <circle cx="25" cy="55" r="2" fill="white" opacity="0.6" />
          <circle cx="75" cy="55" r="2" fill="white" opacity="0.6" />
          
          {/* Corner Accents */}
          <path
            d="M15 25 L25 25 L25 35 L15 35 Z"
            fill="url(#gradient2)"
            opacity="0.8"
          />
          <path
            d="M75 25 L85 25 L85 35 L75 35 Z"
            fill="url(#gradient2)"
            opacity="0.8"
          />
          
          {/* Gradients */}
          <defs>
            <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#8B5CF6" />
              <stop offset="50%" stopColor="#A855F7" />
              <stop offset="100%" stopColor="#EC4899" />
            </linearGradient>
            <linearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#A855F7" />
              <stop offset="100%" stopColor="#F472B6" />
            </linearGradient>
            <linearGradient id="gradient3" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1F2937" />
              <stop offset="100%" stopColor="#374151" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      
      {/* Logo Text */}
      {showText && (
        <span className={`${textSizes[size]} font-bold tracking-tight bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent`}>
          MovieMate
        </span>
      )}
    </div>
  );
};

export default Logo;
