import React from 'react';

/**
 * TreeHouseLogo Component
 * Scalable vector logo for System Tree House (Smart by Nature)
 * Supports custom width, height, and showTagline option.
 */
export default function TreeHouseLogo({ size = 48, showText = true, className = '' }) {
  return (
    <div className={`inline-flex items-center gap-3 select-none ${className}`}>
      <svg
        viewBox="0 0 500 500"
        width={size}
        height={size}
        className="shrink-0 drop-shadow-sm"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Foliage / Leaves (Crown of Tree) */}
        <g fill="#4E8732">
          {/* Center Square Block */}
          <rect x="231" y="142" width="38" height="38" rx="3" />
          <rect x="279" y="161" width="18" height="18" rx="2" />
          <rect x="203" y="161" width="18" height="18" rx="2" />

          {/* Top Center Leaves */}
          <path d="M 250,75 C 235,95 235,120 250,130 C 265,120 265,95 250,75 Z" />
          <path d="M 288,98 C 275,115 280,138 296,144 C 307,130 305,108 288,98 Z" />
          <path d="M 212,98 C 229,108 227,130 216,144 C 200,138 205,115 212,98 Z" />

          {/* Upper Outer Leaves */}
          <path d="M 334,130 C 315,142 315,165 330,175 C 344,164 348,142 334,130 Z" />
          <path d="M 166,130 C 180,142 176,164 162,175 C 147,165 147,142 166,130 Z" />

          {/* Side Leaves */}
          <path d="M 362,185 C 340,190 335,212 346,225 C 362,217 372,198 362,185 Z" />
          <path d="M 138,185 C 128,198 138,217 154,225 C 165,212 160,190 138,185 Z" />

          {/* Lower Branch Leaves */}
          <path d="M 308,198 C 298,180 310,165 324,170 C 328,185 320,198 308,198 Z" />
          <path d="M 192,198 C 204,198 196,185 200,170 C 214,165 226,180 216,198 Z" />
        </g>

        {/* House Outline & Tree Trunks (Brown) */}
        <g fill="#3D2817">
          {/* Tree Trunk Left to Roof Slope */}
          <path d="M 170,335 L 170,255 C 170,230 185,215 210,198 L 250,170 L 290,198 C 315,215 330,230 330,255 L 330,335 L 318,335 L 318,258 C 318,240 306,228 288,214 L 250,188 L 212,214 C 194,228 182,240 182,258 L 182,335 Z" />

          {/* Upper Branch Splays */}
          <path d="M 188,235 C 194,210 196,190 193,170 C 190,185 186,205 180,225 Z" />
          <path d="M 312,235 C 306,210 304,190 307,170 C 310,185 314,205 320,225 Z" />

          {/* Attic Gable Triangle */}
          <path d="M 215,245 L 285,245 L 250,215 Z" />

          {/* Kitchen / Interior Silhouettes */}
          {/* Refrigerator (Left) */}
          <rect x="202" y="255" width="36" height="78" rx="4" />
          {/* Freezer Divider Line */}
          <rect x="202" y="288" width="36" height="3" fill="#FFFFFF" />
          {/* Handles (White Slits) */}
          <rect x="207" y="267" width="3" height="14" rx="1.5" fill="#FFFFFF" />
          <rect x="207" y="296" width="3" height="20" rx="1.5" fill="#FFFFFF" />

          {/* Range Hood (Top Right) */}
          <rect x="268" y="255" width="6" height="15" />
          <path d="M 256,285 L 286,285 L 274,270 L 268,270 Z" />

          {/* Pendant Light (Right of Hood) */}
          <rect x="294" y="255" width="2" height="32" />
          <circle cx="295" cy="292" r="6" />

          {/* Kitchen Stove & Counter Unit (Bottom Right) */}
          <rect x="245" y="310" width="58" height="25" rx="3" />
          {/* Oven Details */}
          <path d="M 252,314 L 268,314 C 270,314 270,311 268,311 L 252,311 C 250,311 250,314 252,314 Z" fill="#FFFFFF" />
          <circle cx="258" cy="324" r="3" fill="#FFFFFF" />
          <circle cx="270" cy="324" r="3" fill="#FFFFFF" />
        </g>
      </svg>

      {showText && (
        <div className="flex flex-col text-right leading-tight">
          <span className="font-extrabold tracking-wider text-[#43792B] text-lg uppercase font-sans">
            TREE HOUSE
          </span>
          <span className="text-[10px] tracking-[3px] font-bold text-[#3D2817] uppercase">
            SMART BY NATURE
          </span>
        </div>
      )}
    </div>
  );
}
