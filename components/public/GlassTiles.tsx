'use client';

import { Camera, Aperture, Image, Film } from 'lucide-react';

/*
  GlassTiles — floating 3-D glass icon tiles for the hero section.
  Pure CSS: perspective + rotateX/Y + multiple gradient sheen layers.
  No Three.js needed; looks close to the Apple-style glass icons in the reference.
*/

interface Tile {
  icon: React.ReactNode;
  tint: string;          // base hue overlay
  sheen: string;         // top-left gloss highlight colour
  delay: string;
  rotate: string;        // initial resting tilt (CSS transform)
  floatAnim: string;     // which float keyframe to use
}

const tiles: Tile[] = [
  {
    icon: <Camera size={38} strokeWidth={1.4} />,
    tint:  'rgba(180,200,255,0.18)',
    sheen: 'rgba(255,255,255,0.55)',
    delay: '0s',
    rotate: 'rotateX(14deg) rotateY(-18deg) rotateZ(-6deg)',
    floatAnim: 'tile-float-a',
  },
  {
    icon: <Aperture size={38} strokeWidth={1.4} />,
    tint:  'rgba(255,140,120,0.18)',
    sheen: 'rgba(255,210,180,0.5)',
    delay: '0.6s',
    rotate: 'rotateX(10deg) rotateY(16deg) rotateZ(5deg)',
    floatAnim: 'tile-float-b',
  },
  {
    icon: <Image size={38} strokeWidth={1.4} />,
    tint:  'rgba(120,230,180,0.14)',
    sheen: 'rgba(200,255,230,0.45)',
    delay: '1.1s',
    rotate: 'rotateX(-8deg) rotateY(-14deg) rotateZ(4deg)',
    floatAnim: 'tile-float-c',
  },
  {
    icon: <Film size={38} strokeWidth={1.4} />,
    tint:  'rgba(200,140,255,0.16)',
    sheen: 'rgba(230,200,255,0.48)',
    delay: '1.7s',
    rotate: 'rotateX(12deg) rotateY(20deg) rotateZ(-4deg)',
    floatAnim: 'tile-float-a',
  },
];

export default function GlassTiles() {
  return (
    <>
      <style>{`
        @keyframes tile-float-a {
          0%,100% { transform: var(--tile-rotate) translateY(0px);   }
          40%      { transform: var(--tile-rotate) translateY(-14px); }
          70%      { transform: var(--tile-rotate) translateY(-6px);  }
        }
        @keyframes tile-float-b {
          0%,100% { transform: var(--tile-rotate) translateY(0px);   }
          35%      { transform: var(--tile-rotate) translateY(-18px); }
          65%      { transform: var(--tile-rotate) translateY(-4px);  }
        }
        @keyframes tile-float-c {
          0%,100% { transform: var(--tile-rotate) translateY(0px);   }
          50%      { transform: var(--tile-rotate) translateY(-12px); }
        }

        .glass-tile {
          position: absolute;
          width: 110px;
          height: 110px;
          border-radius: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: rgba(255,255,255,0.88);

          /* Glass base */
          background:
            /* top-left specular gloss */
            radial-gradient(ellipse at 28% 22%, var(--sheen) 0%, transparent 55%),
            /* bottom rim */
            linear-gradient(160deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.04) 100%),
            /* tint */
            var(--tint);
          backdrop-filter: blur(18px) saturate(1.6);
          -webkit-backdrop-filter: blur(18px) saturate(1.6);

          border: 1px solid rgba(255,255,255,0.28);
          box-shadow:
            0 2px 0 rgba(255,255,255,0.22) inset,   /* top edge highlight */
            0 -1px 0 rgba(255,255,255,0.08) inset,  /* bottom edge */
            0 24px 60px rgba(0,0,0,0.45),
            0 6px 18px rgba(0,0,0,0.3);

          perspective: 800px;
          transform-style: preserve-3d;
          animation-duration: 5s;
          animation-timing-function: ease-in-out;
          animation-iteration-count: infinite;
          animation-fill-mode: both;
        }

        /* thin edge depth face */
        .glass-tile::after {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: 28px;
          background: linear-gradient(
            135deg,
            rgba(255,255,255,0.18) 0%,
            transparent 50%,
            rgba(0,0,0,0.08) 100%
          );
          pointer-events: none;
        }
      `}</style>

      {/* Perspective wrapper */}
      <div
        style={{
          position: 'absolute',
          top: 0, right: 0, bottom: 0,
          width: '52%',
          perspective: '1200px',
          perspectiveOrigin: '50% 50%',
          zIndex: 4,
          pointerEvents: 'none',
        }}
      >
        {/* tile 0 — top-right */}
        <div
          className="glass-tile"
          style={{
            top: '14%', right: '16%',
            '--tile-rotate': tiles[0].rotate,
            '--tint': tiles[0].tint,
            '--sheen': tiles[0].sheen,
            transform: tiles[0].rotate,
            animationName: tiles[0].floatAnim,
            animationDelay: tiles[0].delay,
          } as React.CSSProperties}
        >
          {tiles[0].icon}
        </div>

        {/* tile 1 — mid-right */}
        <div
          className="glass-tile"
          style={{
            top: '36%', right: '6%',
            '--tile-rotate': tiles[1].rotate,
            '--tint': tiles[1].tint,
            '--sheen': tiles[1].sheen,
            transform: tiles[1].rotate,
            animationName: tiles[1].floatAnim,
            animationDelay: tiles[1].delay,
          } as React.CSSProperties}
        >
          {tiles[1].icon}
        </div>

        {/* tile 2 — mid-left of right panel */}
        <div
          className="glass-tile"
          style={{
            top: '30%', right: '40%',
            '--tile-rotate': tiles[2].rotate,
            '--tint': tiles[2].tint,
            '--sheen': tiles[2].sheen,
            transform: tiles[2].rotate,
            animationName: tiles[2].floatAnim,
            animationDelay: tiles[2].delay,
          } as React.CSSProperties}
        >
          {tiles[2].icon}
        </div>

        {/* tile 3 — lower */}
        <div
          className="glass-tile"
          style={{
            top: '58%', right: '22%',
            '--tile-rotate': tiles[3].rotate,
            '--tint': tiles[3].tint,
            '--sheen': tiles[3].sheen,
            transform: tiles[3].rotate,
            animationName: tiles[3].floatAnim,
            animationDelay: tiles[3].delay,
          } as React.CSSProperties}
        >
          {tiles[3].icon}
        </div>
      </div>
    </>
  );
}
