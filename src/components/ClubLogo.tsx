import React from 'react';

interface ClubLogoProps {
  className?: string;
  size?: number;
  showText?: boolean;
}

export const ClubLogo: React.FC<ClubLogoProps> = ({
  className = 'w-12 h-12',
  size = 48,
  showText = false,
}) => {
  return (
    <div className={`inline-flex items-center gap-2.5 ${showText ? '' : ''}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`${className} shrink-0 drop-shadow-sm select-none`}
        aria-label="Zonguldak Tenis Deniz Spor Kulübü Resmi Logosu"
      >
        <defs>
          {/* Circular text path for ZONGULDAK TENİS DENİZ SPOR KULÜBÜ */}
          <path
            id="ztdskUpperArc"
            d="M 18, 100 A 82, 82 0 1, 1 182, 100"
            fill="none"
          />

          {/* Circular text path for * 1951 * */}
          <path
            id="ztdskLowerArc"
            d="M 182, 100 A 82, 82 0 0, 1 18, 100"
            fill="none"
          />

          {/* Ball Seam Filter / Clip */}
          <clipPath id="leftBallClip">
            <circle cx="73" cy="107" r="9" />
          </clipPath>
          <clipPath id="midBallClip">
            <circle cx="100" cy="107" r="9" />
          </clipPath>
          <clipPath id="rightBallClip">
            <circle cx="127" cy="107" r="9" />
          </clipPath>
        </defs>

        {/* 1. Outermost Blue & White Border */}
        <circle cx="100" cy="100" r="97" fill="#ffffff" stroke="#25358d" strokeWidth="4" />
        <circle cx="100" cy="100" r="94" fill="#ffffff" stroke="#25358d" strokeWidth="1" />

        {/* 2. White Ring with Official Text */}
        <text
          fill="#25358d"
          fontSize="9.2"
          fontWeight="900"
          letterSpacing="0.9"
          fontFamily="system-ui, -apple-system, sans-serif"
          style={{ textTransform: 'uppercase' }}
        >
          <textPath href="#ztdskUpperArc" startOffset="50%" textAnchor="middle">
            ZONGULDAK TENİS DENİZ SPOR KULÜBÜ
          </textPath>
        </text>

        {/* Bottom Arc: * 1951 * with Stencil Outlined Digits */}
        {/* Left Star */}
        <g fill="#25358d">
          <text
            x="58"
            y="170"
            fontSize="15"
            fontWeight="900"
            textAnchor="middle"
            fontFamily="system-ui, sans-serif"
          >
            ✱
          </text>
        </g>

        {/* 1951 Hollow/Outlined Numbers */}
        <g
          fill="#ffffff"
          stroke="#25358d"
          strokeWidth="1.6"
          strokeLinejoin="round"
          fontSize="17"
          fontWeight="900"
          fontFamily="system-ui, -apple-system, sans-serif"
          letterSpacing="3"
        >
          <text x="100" y="174" textAnchor="middle">
            1951
          </text>
        </g>

        {/* Right Star */}
        <g fill="#25358d">
          <text
            x="142"
            y="170"
            fontSize="15"
            fontWeight="900"
            textAnchor="middle"
            fontFamily="system-ui, sans-serif"
          >
            ✱
          </text>
        </g>

        {/* 3. Inner Circle with Royal Blue Background */}
        <circle cx="100" cy="100" r="68" fill="#25358d" stroke="#25358d" strokeWidth="2" />
        <circle cx="100" cy="100" r="67" fill="#25358d" stroke="#ffffff" strokeWidth="1" />

        {/* 4. Inside the Blue Circle: The 3 White Sails, 3 Tennis Balls & ZTDSK Base */}

        {/* Sail 1 (Left Sail) */}
        <path
          d="M 80 57 C 72 57 65 64 61 74 C 58 83 62 90 71 90 C 76 90 82 85 84 76 C 85 68 83 61 80 57 Z"
          fill="#ffffff"
        />

        {/* Sail 2 (Middle Sail - Slightly Higher) */}
        <path
          d="M 103 49 C 95 49 88 56 84 66 C 81 76 85 83 94 83 C 99 83 105 78 107 69 C 108 60 106 53 103 49 Z"
          fill="#ffffff"
        />

        {/* Sail 3 (Right Sail) */}
        <path
          d="M 126 56 C 118 56 111 63 107 73 C 104 82 108 89 117 89 C 122 89 128 84 130 75 C 131 67 129 60 126 56 Z"
          fill="#ffffff"
        />

        {/* 3 Vertical Masts/Connectors */}
        <rect x="71.5" y="88" width="3" height="12" fill="#ffffff" rx="1.5" />
        <rect x="98.5" y="82" width="3" height="18" fill="#ffffff" rx="1.5" />
        <rect x="125.5" y="87" width="3" height="13" fill="#ffffff" rx="1.5" />

        {/* 3 Tennis Balls with Seam Lines */}
        {/* Ball 1 (Left) */}
        <g clipPath="url(#leftBallClip)">
          <circle cx="73" cy="107" r="9" fill="#ffffff" />
          <path
            d="M 66 101 C 71 104 71 110 66 113"
            stroke="#25358d"
            strokeWidth="1.6"
            fill="none"
          />
          <path
            d="M 80 101 C 75 104 75 110 80 113"
            stroke="#25358d"
            strokeWidth="1.6"
            fill="none"
          />
        </g>
        <circle cx="73" cy="107" r="9" stroke="#ffffff" strokeWidth="1" fill="none" />

        {/* Ball 2 (Center) */}
        <g clipPath="url(#midBallClip)">
          <circle cx="100" cy="107" r="9" fill="#ffffff" />
          <path
            d="M 93 101 C 98 104 98 110 93 113"
            stroke="#25358d"
            strokeWidth="1.6"
            fill="none"
          />
          <path
            d="M 107 101 C 102 104 102 110 107 113"
            stroke="#25358d"
            strokeWidth="1.6"
            fill="none"
          />
        </g>
        <circle cx="100" cy="107" r="9" stroke="#ffffff" strokeWidth="1" fill="none" />

        {/* Ball 3 (Right) */}
        <g clipPath="url(#rightBallClip)">
          <circle cx="127" cy="107" r="9" fill="#ffffff" />
          <path
            d="M 120 101 C 125 104 125 110 120 113"
            stroke="#25358d"
            strokeWidth="1.6"
            fill="none"
          />
          <path
            d="M 134 101 C 129 104 129 110 134 113"
            stroke="#25358d"
            strokeWidth="1.6"
            fill="none"
          />
        </g>
        <circle cx="127" cy="107" r="9" stroke="#ffffff" strokeWidth="1" fill="none" />

        {/* 5. The Boat Hull / Pedestal Base Container */}
        {/* Top scalloped arches under balls, sides drop down, bottom base */}
        <path
          d="M 64 118 
             C 68 115 78 115 82 118 
             C 86 115 96 115 100 118 
             C 104 115 114 115 118 118 
             C 122 115 132 115 136 118
             L 134 146
             L 66 146
             Z"
          fill="none"
          stroke="#ffffff"
          strokeWidth="2"
          strokeLinejoin="round"
        />

        {/* Wavy Horizontal Ribbon for ZTDSK */}
        <path
          d="M 66 126
             Q 83 123 100 126
             Q 117 129 134 126
             L 133 144
             Q 116 147 100 144
             Q 84 141 67 144
             Z"
          fill="#25358d"
          stroke="#ffffff"
          strokeWidth="1.8"
        />

        {/* ZTDSK Bold White Text Inside Ribbon */}
        <text
          x="100"
          y="139"
          fill="#ffffff"
          fontSize="12.5"
          fontWeight="900"
          letterSpacing="2.5"
          textAnchor="middle"
          fontFamily="system-ui, -apple-system, sans-serif"
        >
          ZTDSK
        </text>
      </svg>

      {showText && (
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className="font-black text-sm tracking-tight text-blue-900 dark:text-blue-200">
              ZTDSK
            </span>
            <span className="text-[10px] bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 font-bold px-1.5 py-0.2 rounded border border-blue-200 dark:border-blue-800">
              1951
            </span>
          </div>
          <span className="text-[11px] text-slate-600 dark:text-slate-400 font-medium line-clamp-1">
            Zonguldak Tenis Deniz Spor Kulübü
          </span>
        </div>
      )}
    </div>
  );
};
