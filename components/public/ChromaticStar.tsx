'use client';

/**
 * ChromaticStar
 * A 4-petal chrome star rendered with SVG.
 * Each petal has a metallic radial gradient + animated iridescent colour sweep.
 * An SVG filter separates R/G/B channels, offsets them, and blurs each — giving
 * the rainbow-edge chromatic aberration seen in the reference images.
 * The outer <div> uses mix-blend-mode: screen so black areas stay transparent.
 */
export default function ChromaticStar() {
  const petalPath = [
    // top petal
    'M 0,-11 C -52,-65 -68,-138 0,-205 C 68,-138 52,-65 0,-11 Z',
    // right petal
    'M 11,0 C 65,-52 138,-68 205,0 C 138,68 65,52 11,0 Z',
    // bottom petal
    'M 0,11 C 52,65 68,138 0,205 C -68,138 -52,65 0,11 Z',
    // left petal
    'M -11,0 C -65,52 -138,68 -205,0 C -138,-68 -65,-52 -11,0 Z',
  ].join(' ');

  return (
    <div
      className="absolute pointer-events-none"
      style={{
        top: '50%',
        left: '50%',
        transform: 'translate(-38%, -54%)',
        width: '620px',
        height: '620px',
        zIndex: 1,
        mixBlendMode: 'screen',
        opacity: 0.92,
      }}
    >
      <svg
        viewBox="-240 -240 480 480"
        width="100%"
        height="100%"
        style={{ overflow: 'visible' }}
      >
        <defs>
          {/* Chrome gradient — single light source top-left */}
          <radialGradient
            id="sc-chrome"
            cx="-40" cy="-70"
            r="230"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%"   stopColor="#ffffff" stopOpacity="1" />
            <stop offset="15%"  stopColor="#d8eaff" stopOpacity="0.97" />
            <stop offset="38%"  stopColor="#88aaff" stopOpacity="0.82" />
            <stop offset="65%"  stopColor="#2844cc" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#000010" stopOpacity="0" />
          </radialGradient>

          {/* Secondary dimmer gradient for opposite petals */}
          <radialGradient
            id="sc-chrome2"
            cx="60" cy="80"
            r="200"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%"   stopColor="#aabbff" stopOpacity="0.6" />
            <stop offset="50%"  stopColor="#2233aa" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#000010" stopOpacity="0" />
          </radialGradient>

          {/* Animated iridescent rainbow sweep */}
          <linearGradient
            id="sc-iri"
            gradientUnits="userSpaceOnUse"
            x1="-210" y1="-210"
            x2="210"  y2="210"
          >
            <stop offset="0%"   stopColor="#ff3090" stopOpacity="0.75" />
            <stop offset="18%"  stopColor="#40ccff" stopOpacity="0.65" />
            <stop offset="36%"  stopColor="#30ffb0" stopOpacity="0.6"  />
            <stop offset="54%"  stopColor="#ffc030" stopOpacity="0.65" />
            <stop offset="72%"  stopColor="#ff3090" stopOpacity="0.7"  />
            <stop offset="90%"  stopColor="#8030ff" stopOpacity="0.75" />
            <stop offset="100%" stopColor="#40ccff" stopOpacity="0.65" />
            <animateTransform
              attributeName="gradientTransform"
              type="rotate"
              from="0 0 0"
              to="360 0 0"
              dur="9s"
              repeatCount="indefinite"
            />
          </linearGradient>

          {/* Edge specular — thin bright rim */}
          <radialGradient
            id="sc-rim"
            cx="50%" cy="50%" r="50%"
          >
            <stop offset="70%"  stopColor="#ffffff" stopOpacity="0" />
            <stop offset="90%"  stopColor="#ffffff" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </radialGradient>

          {/* ── Chromatic aberration filter ── */}
          {/* Separates source into R / G / B, offsets each, blurs, then screens back together */}
          <filter
            id="sc-ca"
            x="-35%" y="-35%"
            width="170%" height="170%"
            colorInterpolationFilters="sRGB"
          >
            {/* Red — shift right+down */}
            <feColorMatrix
              type="matrix"
              values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0"
              result="rCh"
            />
            <feOffset in="rCh" dx="16" dy="6"  result="rOff" />
            <feGaussianBlur in="rOff" stdDeviation="4" result="rBlur" />

            {/* Green — shift up-left */}
            <feColorMatrix
              in="SourceGraphic"
              type="matrix"
              values="0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0"
              result="gCh"
            />
            <feOffset in="gCh" dx="-6" dy="-16" result="gOff" />
            <feGaussianBlur in="gOff" stdDeviation="3"   result="gBlur" />

            {/* Blue — shift left+down */}
            <feColorMatrix
              in="SourceGraphic"
              type="matrix"
              values="0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0"
              result="bCh"
            />
            <feOffset in="bCh" dx="-16" dy="6"  result="bOff" />
            <feGaussianBlur in="bOff" stdDeviation="4"   result="bBlur" />

            {/* Screen-blend RGB channels */}
            <feBlend in="rBlur" in2="gBlur" mode="screen" result="rg" />
            <feBlend in="rg"    in2="bBlur" mode="screen" result="rgb" />

            {/* Outer glow halo */}
            <feGaussianBlur in="SourceGraphic" stdDeviation="14" result="halo" />
            <feBlend in="rgb" in2="halo" mode="screen" />
          </filter>
        </defs>

        {/* ── Chrome base + iridescent overlay — filtered ── */}
        <g
          filter="url(#sc-ca)"
          style={{ animation: 'spin 32s linear infinite' }}
        >
          {/* Chrome base — primary light */}
          <path d={petalPath} fill="url(#sc-chrome)" />
          {/* Chrome base — fill-light from opposite side */}
          <path d={petalPath} fill="url(#sc-chrome2)" />
          {/* Iridescent rainbow sweep */}
          <path
            d={petalPath}
            fill="url(#sc-iri)"
            style={{ mixBlendMode: 'overlay' }}
          />
        </g>
      </svg>
    </div>
  );
}
