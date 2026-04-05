'use client';

import { Camera, Aperture, Image as ImageIcon, Film } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

const S = 114;  // front face size (px)
const D = 20;   // glass thickness (px)
const R = 26;   // corner radius (px)

interface TileCfg {
  Icon:  LucideIcon;
  tilt:  string;
  tint:  string;   // very subtle rgba tint on the front face
  sheen: string;   // specular highlight colour
  top: string; right: string;
  dur: string; delay: string;
}

const TILES: TileCfg[] = [
  {
    Icon:  Camera,
    tilt:  'rotateX(12deg) rotateY(-22deg) rotateZ(-5deg)',
    tint:  'rgba(148,188,255,0.14)',
    sheen: 'rgba(255,255,255,0.70)',
    top: '11%', right: '13%', dur: '5.2s', delay: '0s',
  },
  {
    Icon:  Aperture,
    tilt:  'rotateX(8deg) rotateY(19deg) rotateZ(4deg)',
    tint:  'rgba(255,170,120,0.14)',
    sheen: 'rgba(255,215,185,0.66)',
    top: '37%', right: '3%', dur: '6.1s', delay: '0.75s',
  },
  {
    Icon:  ImageIcon,
    tilt:  'rotateX(-9deg) rotateY(-18deg) rotateZ(3deg)',
    tint:  'rgba(108,225,168,0.12)',
    sheen: 'rgba(195,255,222,0.62)',
    top: '26%', right: '37%', dur: '4.9s', delay: '1.35s',
  },
  {
    Icon:  Film,
    tilt:  'rotateX(13deg) rotateY(21deg) rotateZ(-4deg)',
    tint:  'rgba(192,136,255,0.14)',
    sheen: 'rgba(228,200,255,0.64)',
    top: '57%', right: '19%', dur: '5.7s', delay: '1.95s',
  },
];

/*
  Glass edge style — shared across all 4 side faces.
  Pure white-to-transparent gradient + backdrop-filter so the edge
  looks like real frosted glass rather than a coloured panel.
  The border on each face's free edge adds the bright rim line.
*/
const edgeBase = {
  backdropFilter:       'blur(18px) saturate(1.6) brightness(1.15)',
  WebkitBackdropFilter: 'blur(18px) saturate(1.6) brightness(1.15)',
  backfaceVisibility:   'hidden' as const,
};

export default function GlassTiles() {
  return (
    <>
      <style>{`
        @keyframes gtFloat {
          0%,100% { transform: var(--gt-tilt) translateY(0px);   }
          45%      { transform: var(--gt-tilt) translateY(-18px); }
          72%      { transform: var(--gt-tilt) translateY(-7px);  }
        }
        @keyframes gtShadow {
          0%,100% { transform: scaleX(1.00); opacity: 0.38; }
          45%      { transform: scaleX(0.66); opacity: 0.16; }
          72%      { transform: scaleX(0.84); opacity: 0.26; }
        }
      `}</style>

      <div style={{
        position: 'absolute',
        top: 0, right: 0, bottom: 0,
        width: '54%',
        zIndex: 4,
        pointerEvents: 'none',
      }}>
        {TILES.map(({ Icon, tilt, tint, sheen, top, right, dur, delay }, i) => (
          <div key={i} style={{ position: 'absolute', top, right, width: S, height: S }}>

            {/* Floating shadow */}
            <div style={{
              position: 'absolute',
              top: S + 14, left: '9%',
              width: '82%', height: 16,
              borderRadius: '50%',
              background: 'rgba(0,0,0,0.50)',
              filter: 'blur(12px)',
              animation: `gtShadow ${dur} ease-in-out ${delay} infinite`,
            }} />

            {/* 3-D box — no transform on any ancestor → preserve-3d intact */}
            <div style={{
              position: 'absolute', inset: 0,
              transformStyle: 'preserve-3d',
              ['--gt-tilt' as string]: tilt,
              animation: `gtFloat ${dur} ease-in-out ${delay} infinite`,
            }}>

              {/* ── FRONT FACE ──────────────────────────────────────
                  backdrop-filter blurs the aurora CSS gradient behind it.   */}
              <div style={{
                position: 'absolute', inset: 0,
                borderRadius: R,
                background: `
                  radial-gradient(ellipse at 27% 20%, ${sheen} 0%, transparent 52%),
                  linear-gradient(150deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.04) 100%),
                  ${tint}
                `,
                backdropFilter:       'blur(28px) saturate(2.0) brightness(1.12)',
                WebkitBackdropFilter: 'blur(28px) saturate(2.0) brightness(1.12)',
                border: '1px solid rgba(255,255,255,0.44)',
                boxShadow: `
                  0 2px 0 rgba(255,255,255,0.36) inset,
                  0 -1px 0 rgba(255,255,255,0.06) inset,
                  1px 0 0 rgba(255,255,255,0.18) inset
                `,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>

                {/* ── ICON — extruded relief, not a flat stamp ────────────
                    Stacked drop-shadows: bright above + dark below simulate
                    the icon lines being physically raised from the surface.  */}
                <div style={{
                  color: 'rgba(255,255,255,0.96)',
                  filter: [
                    'drop-shadow(0 -1.5px 0 rgba(255,255,255,0.55))',  // top highlight
                    'drop-shadow(-1px 0   0 rgba(255,255,255,0.22))',  // left highlight
                    'drop-shadow(0  2px  0 rgba(0,0,0,0.60))',         // bottom shadow
                    'drop-shadow(1px 0   0 rgba(0,0,0,0.32))',         // right shadow
                    'drop-shadow(0  3px 6px rgba(0,0,0,0.35))',        // soft depth
                  ].join(' '),
                }}>
                  <Icon size={40} strokeWidth={1.8} />
                </div>

                {/* Top gloss band */}
                <div style={{
                  position: 'absolute', top: 0, left: 0, right: 0,
                  height: '46%',
                  borderRadius: `${R}px ${R}px 50% 50% / ${R}px ${R}px 26% 26%`,
                  background: 'linear-gradient(180deg, rgba(255,255,255,0.26) 0%, transparent 100%)',
                  pointerEvents: 'none',
                }} />
              </div>

              {/* ── RIGHT FACE ─────────────────────────────────────────────
                  Pure white gradient — no coloured tint so it reads as glass. */}
              <div style={{
                position: 'absolute',
                top: 0, left: S, width: D, height: S,
                borderRadius: `0 ${R}px ${R}px 0`,
                transformOrigin: '0% 50%',
                transform: 'rotateY(90deg)',
                background: `linear-gradient(to bottom,
                  rgba(255,255,255,0.50) 0%,
                  rgba(255,255,255,0.22) 35%,
                  rgba(255,255,255,0.10) 65%,
                  rgba(255,255,255,0.04) 100%
                )`,
                borderTop:    '1px solid rgba(255,255,255,0.30)',
                borderRight:  '1px solid rgba(255,255,255,0.20)',
                borderBottom: '1px solid rgba(255,255,255,0.12)',
                ...edgeBase,
              }} />

              {/* ── LEFT FACE ── */}
              <div style={{
                position: 'absolute',
                top: 0, left: -D, width: D, height: S,
                borderRadius: `${R}px 0 0 ${R}px`,
                transformOrigin: '100% 50%',
                transform: 'rotateY(-90deg)',
                background: `linear-gradient(to bottom,
                  rgba(255,255,255,0.40) 0%,
                  rgba(255,255,255,0.16) 40%,
                  rgba(255,255,255,0.06) 100%
                )`,
                borderTop:    '1px solid rgba(255,255,255,0.28)',
                borderLeft:   '1px solid rgba(255,255,255,0.18)',
                borderBottom: '1px solid rgba(255,255,255,0.10)',
                ...edgeBase,
              }} />

              {/* ── TOP FACE ── */}
              <div style={{
                position: 'absolute',
                top: -D, left: 0, width: S, height: D,
                borderRadius: `${R}px ${R}px 0 0`,
                transformOrigin: '50% 100%',
                transform: 'rotateX(90deg)',
                background: `linear-gradient(to right,
                  rgba(255,255,255,0.48) 0%,
                  rgba(255,255,255,0.28) 50%,
                  rgba(255,255,255,0.16) 100%
                )`,
                borderTop:   '1px solid rgba(255,255,255,0.36)',
                borderLeft:  '1px solid rgba(255,255,255,0.22)',
                borderRight: '1px solid rgba(255,255,255,0.16)',
                ...edgeBase,
              }} />

              {/* ── BOTTOM FACE ── */}
              <div style={{
                position: 'absolute',
                top: S, left: 0, width: S, height: D,
                borderRadius: `0 0 ${R}px ${R}px`,
                transformOrigin: '50% 0%',
                transform: 'rotateX(-90deg)',
                background: `linear-gradient(to right,
                  rgba(255,255,255,0.14) 0%,
                  rgba(255,255,255,0.28) 45%,
                  rgba(255,255,255,0.14) 100%
                )`,
                borderBottom: '1px solid rgba(255,255,255,0.16)',
                borderLeft:   '1px solid rgba(255,255,255,0.12)',
                borderRight:  '1px solid rgba(255,255,255,0.10)',
                ...edgeBase,
              }} />

            </div>
          </div>
        ))}
      </div>
    </>
  );
}
