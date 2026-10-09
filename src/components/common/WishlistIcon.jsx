import React from 'react';

const WishlistIcon = ({ size = 24, color = "currentColor", fill = "none", strokeWidth = 2, className = "", ...props }) => {
  const isFilled = fill && fill !== "none" && fill !== "transparent";
  
  // When active (filled), the bookmark is filled with the primary color, 
  // and the inner scales are 'punched out' in white for maximum clarity.
  const innerColor = isFilled ? "#ffffff" : color;
  const actualFill = isFilled ? color : "none";

  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill={actualFill} 
      stroke={color} 
      strokeWidth={strokeWidth} 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={`lucide lucide-wishlist-icon ${className}`}
      {...props}
    >
      {/* 
        Standard Bookmark outline (narrower, normal width)
      */}
      <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
      
      {/* 
        Highly simplified, minimalist scale fitted inside the standard bookmark.
      */}
      <g stroke={innerColor} fill={isFilled ? innerColor : "none"} strokeWidth={strokeWidth * 0.75}>
        {/* Central Pillar */}
        <line x1="12" y1="6" x2="12" y2="13" />
        
        {/* Horizontal Beam */}
        <line x1="8" y1="7" x2="16" y2="7" />
        
        {/* Left Weight */}
        <circle cx="8" cy="11" r="1.25" fill={innerColor} stroke="none" />
        <line x1="8" y1="7" x2="8" y2="9.75" strokeWidth={strokeWidth * 0.5} />

        {/* Right Weight */}
        <circle cx="16" cy="11" r="1.25" fill={innerColor} stroke="none" />
        <line x1="16" y1="7" x2="16" y2="9.75" strokeWidth={strokeWidth * 0.5} />
      </g>
    </svg>
  );
};

export default WishlistIcon;
